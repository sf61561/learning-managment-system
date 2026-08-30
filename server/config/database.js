/** @import { Core } from '@strapi/strapi' */

const path = require('path');
const { isDatabaseClientKind } = require('@strapi/database');

module.exports = ({ env }) => {
  const databaseUrl = env('DATABASE_URL');
  const hasPgEnv = databaseUrl || env('PGHOST') || env('DATABASE_HOST');
  const client = env('DATABASE_CLIENT', hasPgEnv ? 'postgres' : 'sqlite');

  if (!isDatabaseClientKind(client)) {
    throw new Error(
      `Unsupported DATABASE_CLIENT: ${client}. Use "postgres", "mysql", or "sqlite".`
    );
  }

  // Determine SSL configuration for Railway PostgreSQL
  const isSsl = env.bool('DATABASE_SSL', true);
  const sslConfig = isSsl
    ? { rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false) }
    : false;

  let postgresConnection;

  if (databaseUrl) {
    postgresConnection = {
      connectionString: databaseUrl,
      ssl: sslConfig,
      schema: env('DATABASE_SCHEMA', 'public'),
    };
  } else {
    postgresConnection = {
      host: env('PGHOST', env('DATABASE_HOST', 'localhost')),
      port: env.int('PGPORT', env.int('DATABASE_PORT', 5432)),
      database: env('PGDATABASE', env('DATABASE_NAME', 'strapi')),
      user: env('PGUSER', env('DATABASE_USERNAME', 'strapi')),
      password: env('PGPASSWORD', env('DATABASE_PASSWORD', 'strapi')),
      ssl: sslConfig,
      schema: env('DATABASE_SCHEMA', 'public'),
    };
  }

  const connections = {
    postgres: {
      client: 'postgres',
      connection: postgresConnection,
      pool: {
        min: env.int('DATABASE_POOL_MIN', 0),
        max: env.int('DATABASE_POOL_MAX', 10),
        acquireTimeoutMillis: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
      },
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
