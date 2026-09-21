import { serve } from '@hono/node-server';
import { loadConfig } from './config.js';
import { createDatabase } from './db/client.js';
import { migrate } from './db/migrate.js';
import { createApp } from './http/app.js';

const config = loadConfig();
const database = createDatabase(config.databaseUrl);

await migrate(database);

const app = createApp(config, database);
const server = serve({ fetch: app.fetch, hostname: config.host, port: config.port }, (info) => {
  console.log(JSON.stringify({
    level: 'info',
    event: 'server.started',
    address: `${info.address}:${info.port}`,
    publicBaseUrl: config.publicBaseUrl,
  }));
});

async function shutdown(signal: string): Promise<void> {
  console.log(JSON.stringify({ level: 'info', event: 'server.stopping', signal }));
  server.close();
  await database.end({ timeout: 10 });
  process.exit(0);
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
