// backend/prisma.config.ts

import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();
const env = process.env.BACKEND_NODE_ENV;
const databaseProd = process.env.DATABASE_PROD_URL;
const databaseDev = process.env.DATABASE_DEV_URL;

export default defineConfig({
  schema: 'prisma/',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env === 'production' ? databaseProd : databaseDev,
  },
});
