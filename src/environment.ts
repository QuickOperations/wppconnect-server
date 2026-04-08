const {
  // ─── Server ───────────────────────────────────────────────────────
  WPP_SECRET_KEY,
  WPP_HOST,
  WPP_PORT,
  NODE_ENV,

  // ─── Browser ──────────────────────────────────────────────────────
  PUPPETEER_EXECUTABLE_PATH,
  WPP_USER_DATA_DIR,
  WPP_LOG_LEVEL,

  // ─── Webhook ──────────────────────────────────────────────────────
  WPP_WEBHOOK_URL,

  // ─── MongoDB ──────────────────────────────────────────────────────
  MONGO_DATABASE,
  MONGO_COLLECTION,
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_HOST,
  MONGO_PORT,
  MONGO_IS_REMOTE,
  MONGO_URL_REMOTE,

  // ─── Redis ────────────────────────────────────────────────────────
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_DB,
  REDIS_PREFIX,

  // ─── AWS S3 ───────────────────────────────────────────────────────
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_KEY,
  AWS_BUCKET_NAME,
  AWS_ENDPOINT,
  AWS_FORCE_PATH_STYLE,
} = process.env;

export const environment = {
  // ─── Server ─────────────────────────────────────────────────────
  SECRET_KEY: WPP_SECRET_KEY,
  HOST: WPP_HOST ?? 'http://localhost',
  PORT: WPP_PORT ?? '21465',
  NODE_ENV: NODE_ENV ?? 'development',

  // ─── Browser ────────────────────────────────────────────────────
  EXECUTABLE_PATH: PUPPETEER_EXECUTABLE_PATH ?? '/usr/bin/google-chrome-stable',
  USER_DATA_DIR: WPP_USER_DATA_DIR ?? './userDataDir/',
  LOG_LEVEL: WPP_LOG_LEVEL ?? 'info',

  // ─── Webhook ────────────────────────────────────────────────────
  WEBHOOK_URL: WPP_WEBHOOK_URL ?? null,

  // ─── MongoDB ────────────────────────────────────────────────────
  MONGO_DATABASE: MONGO_DATABASE ?? 'tokens',
  MONGO_COLLECTION: MONGO_COLLECTION ?? '',
  MONGO_USER: MONGO_USER ?? '',
  MONGO_PASSWORD: MONGO_PASSWORD ?? '',
  MONGO_HOST: MONGO_HOST ?? '',
  MONGO_PORT: Number(MONGO_PORT ?? 27017),
  MONGO_IS_REMOTE: MONGO_IS_REMOTE === 'true',
  MONGO_URL_REMOTE: MONGO_URL_REMOTE ?? '',

  // ─── Redis ──────────────────────────────────────────────────────
  REDIS_HOST: REDIS_HOST ?? 'localhost',
  REDIS_PORT: Number(REDIS_PORT ?? 6379),
  REDIS_PASSWORD: REDIS_PASSWORD ?? '',
  REDIS_DB: Number(REDIS_DB ?? 0),
  REDIS_PREFIX: REDIS_PREFIX ?? 'docker',

  // ─── AWS S3 ─────────────────────────────────────────────────────
  AWS_REGION: AWS_REGION ?? 'sa-east-1',
  AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID ?? null,
  AWS_SECRET_KEY: AWS_SECRET_KEY ?? null,
  AWS_BUCKET_NAME: AWS_BUCKET_NAME ?? null,
  AWS_ENDPOINT: AWS_ENDPOINT ?? null,
  AWS_FORCE_PATH_STYLE: AWS_FORCE_PATH_STYLE ?? null,
} as const;
