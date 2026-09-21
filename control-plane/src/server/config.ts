import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(8787),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().url().default('postgres://developer:developer@localhost:5432/developer'),
  DEVELOPER_MCP_API_KEY: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:8787'),
  BASE_PATH: z.string().regex(/^\/?(?:[a-zA-Z0-9._~-]+\/?)*$/).default(''),
  ALLOWED_ORIGINS: z.string().default('http://localhost:8787'),
  TRUST_PROXY: z.enum(['true', 'false']).default('false'),
});

export type AppConfig = Readonly<{
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  host: string;
  databaseUrl: string;
  apiKey: string;
  sessionSecret: string;
  publicBaseUrl: string;
  basePath: string;
  allowedOrigins: ReadonlySet<string>;
  allowedHosts: ReadonlySet<string>;
  trustProxy: boolean;
}>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const value = envSchema.parse(env);
  const publicUrl = new URL(value.PUBLIC_BASE_URL);
  const normalizedPath = value.BASE_PATH.replace(/^\//, '').replace(/\/$/, '');
  const basePath = normalizedPath ? `/${normalizedPath}` : '';
  const allowedOrigins = new Set(
    value.ALLOWED_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean),
  );
  allowedOrigins.add(publicUrl.origin);

  return Object.freeze({
    nodeEnv: value.NODE_ENV,
    port: value.PORT,
    host: value.HOST,
    databaseUrl: value.DATABASE_URL,
    apiKey: value.DEVELOPER_MCP_API_KEY,
    sessionSecret: value.SESSION_SECRET,
    publicBaseUrl: publicUrl.toString().replace(/\/$/, ''),
    basePath,
    allowedOrigins,
    allowedHosts: new Set([publicUrl.host, `localhost:${value.PORT}`, `127.0.0.1:${value.PORT}`]),
    trustProxy: value.TRUST_PROXY === 'true',
  });
}
