/** @import { Core } from '@strapi/strapi' */

const path = require('path');
const { isDatabaseClientKind } = require('@strapi/database');
const { parse } = require('pg-connection-string');

module.exports = ({ env }) => {
  const databaseUrl = env('DATABASE_URL');
  const client = env('DATABASE_CLIENT', databaseUrl ? 'postgres' : 'sqlite');

  if (!isDatabaseClientKind(client)) {
    throw new Error(
      `Unsupported DATABASE_CLIENT: ${client}. Use "postgres", "mysql", or "sqlite".`
    );
  }

  // Parse DATABASE_URL if available
  const parsedPostgres = databaseUrl ? parse(databaseUrl) : {};

  const isSsl = env.bool('DATABASE_SSL', false);
  const sslConfig = isSsl
    ? {
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
      }
    : false;

  /** @type {Record<Core.Config.Database.ClientKind, Core.Config.Database['connection']>} */
  const connections = {
    mysql: {
      client: 'mysql',
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 0), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      client: 'postgres',
      connection: {
        host: parsedPostgres.host || env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', parsedPostgres.port ? parseInt(parsedPostgres.port, 10) : 5432),
        database: parsedPostgres.database || env('DATABASE_NAME', 'strapi'),
        user: parsedPostgres.user || env('DATABASE_USERNAME', 'strapi'),
        password: parsedPostgres.password || env('DATABASE_PASSWORD', 'strapi'),
        ssl: sslConfig,
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 0), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    sqlite: {
      client: 'sqlite',
      connection: {
        filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
