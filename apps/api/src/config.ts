/** Typed view of the environment. Every value has a local-dev default; production sets them all. */
export interface AppConfig {
  port: number;
  version: string;
  logLevel: string;
  mysql: { host: string; port: number; user: string; password: string; database: string };
  redis: { host: string; port: number };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: Number(env.PORT ?? 3000),
    version: env.APP_VERSION ?? '0.1.0',
    logLevel: env.LOG_LEVEL ?? 'info',
    mysql: {
      host: env.MYSQL_HOST ?? 'localhost',
      port: Number(env.MYSQL_PORT ?? 3307),
      user: env.MYSQL_USER ?? 'solarerp',
      password: env.MYSQL_PASSWORD ?? 'change-me',
      database: env.MYSQL_DATABASE ?? 'solarerp',
    },
    redis: {
      host: env.REDIS_HOST ?? 'localhost',
      port: Number(env.REDIS_PORT ?? 6379),
    },
  };
}
