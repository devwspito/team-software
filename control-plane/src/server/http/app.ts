import { serveStatic } from '@hono/node-server/serve-static';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { Hono } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import { secureHeaders } from 'hono/secure-headers';
import { z } from 'zod';
import type { AppConfig } from '../config.js';
import type { Database } from '../db/client.js';
import { Repository } from '../db/repository.js';
import { createDeveloperMcpServer } from '../mcp/server.js';
import {
  apiKeyAuthorized,
  createSessionToken,
  requireDashboardAuth,
  sessionCookieName,
  validateRequestBoundary,
} from './auth.js';

export function createApp(config: AppConfig, database: Database): Hono {
  const app = new Hono();
  const repository = new Repository(database);
  const mcpHandler = createMcpHandler(
    ({ requestInfo }) => createDeveloperMcpServer(repository, requestInfo),
    {
      legacy: 'stateless',
      responseMode: 'auto',
      onerror: (error) => console.error(JSON.stringify({ level: 'error', scope: 'mcp', message: error.message })),
    },
  );

  app.use('*', secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
    strictTransportSecurity: config.nodeEnv === 'production' ? 'max-age=31536000; includeSubDomains' : false,
  }));

  app.get('/health/live', (context) => context.json({ status: 'ok' }));
  app.get('/health/ready', async (context) => {
    try {
      await database`SELECT 1`;
      return context.json({ status: 'ready' });
    } catch {
      return context.json({ status: 'not-ready' }, 503);
    }
  });

  app.post(route(config.basePath, '/auth/login'), async (context) => {
    const boundaryError = validateRequestBoundary(context.req.raw, config);
    if (boundaryError) return context.json({ error: boundaryError }, 403);
    const body = z.object({ apiKey: z.string() }).safeParse(await context.req.json().catch(() => null));
    if (!body.success || !apiKeyAuthorized(`Bearer ${body.data.apiKey}`, config.apiKey)) {
      return context.json({ error: 'invalid_credentials' }, 401);
    }
    setCookie(context, sessionCookieName, createSessionToken(config.sessionSecret), {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'Strict',
      path: '/',
      maxAge: 43_200,
    });
    return context.json({ authenticated: true });
  });

  app.post(route(config.basePath, '/auth/logout'), (context) => {
    deleteCookie(context, sessionCookieName, { path: '/', secure: config.nodeEnv === 'production' });
    return context.json({ authenticated: false });
  });

  app.all(route(config.basePath, '/mcp'), async (context) => {
    if (!apiKeyAuthorized(context.req.header('authorization'), config.apiKey)) {
      return context.json({ error: 'unauthorized' }, 401, { 'WWW-Authenticate': 'Bearer realm="developer-mcp"' });
    }
    const boundaryError = validateRequestBoundary(context.req.raw, config);
    if (boundaryError) return context.json({ error: boundaryError }, 403);
    return mcpHandler.fetch(context.req.raw);
  });

  app.use(route(config.basePath, '/api/*'), requireDashboardAuth(config));

  app.get(route(config.basePath, '/api/projects'), async (context) => context.json({ projects: await repository.listProjects() }));
  app.get(route(config.basePath, '/api/projects/:slug'), async (context) => {
    try {
      const projectSlug = context.req.param('slug');
      if (!projectSlug) return context.json({ error: 'not_found' }, 404);
      return context.json({ snapshot: await repository.snapshot(projectSlug) });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Unknown project:')) {
        return context.json({ error: 'not_found' }, 404);
      }
      throw error;
    }
  });
  app.get(route(config.basePath, '/api/dashboard'), async (context) => {
    const projects = await repository.listProjects();
    const snapshots = await Promise.all(projects.map(async (project) => repository.snapshot(project.slug)));
    return context.json({ generatedAt: new Date().toISOString(), snapshots });
  });

  app.use(route(config.basePath, '/assets/*'), serveStatic({
    root: './dist/public',
    rewriteRequestPath: (path) => path.slice(config.basePath.length),
  }));
  app.get(route(config.basePath, '/favicon.svg'), serveStatic({ path: './dist/public/favicon.svg' }));
  if (config.basePath) app.get(config.basePath, (context) => context.redirect(`${config.basePath}/`));
  app.get(route(config.basePath, '/*'), serveStatic({ path: './dist/public/index.html' }));

  app.onError((error, context) => {
    console.error(JSON.stringify({ level: 'error', scope: 'http', message: error.message }));
    return context.json({ error: 'internal_error' }, 500);
  });

  return app;
}

function route(basePath: string, path: string): string {
  return `${basePath}${path}` || '/';
}
