import { ServerOptions } from './types/ServerOptions';
import { environment } from './environment';

const env = environment;

function envNumber(name: string, fallback: number): number {
  const value = env[name];
  if (!value) return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default {
  secretKey: env.SECRET_KEY || 'THISISMYSECURETOKEN',
  host: env.HOST || 'http://localhost',
  port: env.PORT || '21465',
  deviceName: 'Google Chrome',
  poweredBy: 'Google Chrome',
  startAllSession: true,
  tokenStoreType: env.TOKEN_STORE_TYPE || 'file',
  maxListeners: envNumber('MAX_LISTENERS', 15),
  customUserDataDir: env.USER_DATA_DIR || './userDataDir/',
  webhook: {
    url: env.WEBHOOK_URL || null,
    autoDownload: false,
    uploadS3: false,
    readMessage: false,
    allUnreadOnStart: false,
    listenAcks: true,
    onPresenceChanged: false,
    onParticipantsChanged: false,
    onReactionMessage: false,
    onPollResponse: false,
    onRevokedMessage: false,
    onLabelUpdated: false,
    onSelfMessage: true,
    ignore: ['status@broadcast', 'onupdatelabel'],
  },

  websocket: {
    autoDownload: false,
    uploadS3: false,
  },

  chatwoot: {
    sendQrCode: true,
    sendStatus: true,
  },

  archive: {
    enable: false,
    waitTime: 10,
    daysToArchive: 45,
  },

  log: {
    level: environment.LOG_LEVEL,
    logger: ['console', 'file'],
  },

  createOptions: {
    useChrome: false,
    executablePath: environment.EXECUTABLE_PATH,
    autoClose: 180000,
    deviceSyncTimeout: 180000,
    waitForLogin: true,
    puppeteerOptions: {
      protocolTimeout: 120000,
      dumpio: true,
    },
    browserArgs: [
      // Sandbox (requerido en Docker)
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',

      // Memoria (tope heap V8 por renderer)
      '--js-flags=--max-old-space-size=1024',
      '--renderer-process-limit=2',

      // Rendimiento
      '--disable-gpu',
      '--disable-webgl',
      '--disable-accelerated-2d-canvas',

      // Red y caché
      '--disable-background-networking',
      '--aggressive-cache-discard',
      '--disable-cache',
      '--disable-application-cache',
      '--disk-cache-size=0',

      // UI innecesaria
      '--disable-extensions',
      '--disable-default-apps',
      '--disable-translate',
      '--disable-sync',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-first-run',

      // Misc
      '--metrics-recording-only',
      '--safebrowsing-disable-auto-update',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-certificate-errors-spki-list',
    ],
    linkPreviewApiServers: null,
  },

  mapper: {
    enable: false,
    prefix: 'tagone-',
  },

  db: {
    mongodbDatabase: env.MONGODB_DATABASE || 'tokens',
    mongodbCollection: env.MONGODB_COLLECTION || '',
    mongodbUser: env.MONGODB_USER || '',
    mongodbPassword: env.MONGODB_PASSWORD || '',
    mongodbHost: env.MONGODB_HOST || '',
    mongoIsRemote: env.MONGO_IS_REMOTE || true,
    mongoURLRemote: env.MONGO_URL_REMOTE || '',
    mongodbPort: envNumber('MONGODB_PORT', 27017),
    redisHost: env.REDIS_HOST || 'localhost',
    redisPort: envNumber('REDIS_PORT', 6379),
    redisPassword: env.REDIS_PASSWORD || '',
    redisDb: envNumber('REDIS_DB', 0),
    redisPrefix: env.REDIS_PREFIX || 'docker',
  },

  aws_s3: {
    region: env.AWS_REGION as any,
    access_key_id: env.AWS_ACCESS_KEY_ID,
    secret_key: env.AWS_SECRET_KEY,
    defaultBucketName: env.AWS_BUCKET_NAME,
    endpoint: env.AWS_ENDPOINT,
    forcePathStyle: env.AWS_FORCE_PATH_STYLE,
  },
} as unknown as ServerOptions;
