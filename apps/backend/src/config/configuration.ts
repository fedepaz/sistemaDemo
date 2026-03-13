// apps/backend/src/config/configuration.ts
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

// Define a strict type for our configuration
export type AppConfig = {
  environment: string;
  port: number;
  url: string;
  cors: {
    origins: string;
  };
  database_prod: {
    name: string;
    host: string;
    port: number;
    username: string;
    password: string;
    databaseUrl: string;
  };
  database_dev: {
    name: string;
    host: string;
    port: number;
    username: string;
    password: string;
    databaseUrl: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  defaultTenantId: string;
  defaultPassword: string;
};

// Create a typed factory function
const configFactory = (): AppConfig => ({
  environment: process.env.BACKEND_NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  url: process.env.URL || 'http://localhost:3001',
  cors: {
    origins: process.env.CORS_ORIGINS || '',
  },
  database_prod: {
    name: process.env.DATABASE_PROD_NAME || '',
    host: process.env.DATABASE_PROD_HOST || '',
    port: parseInt(process.env.DATABASE_PROD_PORT || '', 10),
    username: process.env.DATABASE_PROD_USERNAME || '',
    password: process.env.DATABASE_PROD_PASSWORD || '',
    databaseUrl: process.env.DATABASE_PROD_URL || '',
  },
  database_dev: {
    name: process.env.DATABASE_DEV_NAME || '',
    host: process.env.DATABASE_DEV_HOST || '',
    port: parseInt(process.env.DATABASE_DEV_PORT || '', 10),
    username: process.env.DATABASE_DEV_USERNAME || '',
    password: process.env.DATABASE_DEV_PASSWORD || '',
    databaseUrl: process.env.DATABASE_DEV_URL || '',
  },
  jwt: {
    secret:
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      'your-super-secret-refresh-jwt-key-change-in-prod',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  defaultTenantId: process.env.DEFAULT_TENANT_ID || '',
  defaultPassword: process.env.DEFAULT_PASSWORD || '',
});

// Export the final configuration
export const configuration = registerAs<AppConfig>('config', configFactory);

// Joi validation schema
export const validationSchema = Joi.object({
  BACKEND_NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().port().optional(),
  URL: Joi.string().uri().optional(),
  CORS_ORIGINS: Joi.string().optional(),

  DATABASE_PROD_NAME: Joi.string().required(),
  DATABASE_PROD_HOST: Joi.string().hostname().required(),
  DATABASE_PROD_PORT: Joi.number().port().required(),
  DATABASE_PROD_USERNAME: Joi.string().required(),
  DATABASE_PROD_PASSWORD: Joi.string().required(),
  DATABASE_PROD_URL: Joi.string().uri().required(),

  DATABASE_DEV_NAME: Joi.string().required(),
  DATABASE_DEV_HOST: Joi.string().hostname().required(),
  DATABASE_DEV_PORT: Joi.number().port().required(),
  DATABASE_DEV_USERNAME: Joi.string().required(),
  DATABASE_DEV_PASSWORD: Joi.string().required(),
  DATABASE_DEV_URL: Joi.string().uri().required(),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  DEFAULT_TENANT_ID: Joi.string().optional().allow(''),
  DEFAULT_PASSWORD: Joi.string().optional().allow(''),
});
