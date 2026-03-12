// backend/prisma.config.ts

import { defineConfig } from 'prisma/config';

const databaseDocker = process.env.DATABASE_DOCKER_URL;

export default defineConfig({
  schema: 'prisma/',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseDocker,
  },
});
