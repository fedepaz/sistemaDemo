// backend/prisma.config.ts

import { defineConfig } from 'prisma/config';

const env = process.env.NODE_ENV;
const databaseProduction = process.env.DATABASE_URL;
const databaseDocker = process.env.DATABASE_DOCKER_URL;

export default defineConfig({
  schema: 'prisma/',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env === 'production' ? databaseProduction : databaseDocker,
  },
});
