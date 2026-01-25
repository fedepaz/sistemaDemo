// backend/prisma.config.ts

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
import * as path from 'path';

const buildDatabaseUrl = () => {
  const user = env('DATABASE_USERNAME');
  const password = encodeURIComponent(env('DATABASE_PASSWORD') || '');
  const host = env('DATABASE_HOST');
  const port = env('DATABASE_PORT');
  const database = env('DATABASE_NAME');
  const certPath = path.join(process.cwd(), 'certs', 'globalsignrootca.pem');

  // MySQL doesn't support sslca in connection string well
  // Try ssl-mode instead
  return `mysql://${user}:${password}@${host}:${port}/${database}?ssl-mode=REQUIRED`;
};

export default defineConfig({
  schema: 'prisma/',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: buildDatabaseUrl(),
  },
});
