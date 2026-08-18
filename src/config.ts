import { ServerOptions } from './types/ServerOptions';
import { environment } from './environment';

const env = environment;

export default {
  secretKey: env.SECRET_KEY || 'THISISMYSECURETOKEN',
  host: env.HOST || 'http://localhost',
  port: env.PORT || '21465',
  deviceName: 'Google Chrome',
  poweredBy: 'Google Chrome',
  startAllSession: true,
  tokenStoreType: env.TOKEN_STORE_TYPE || 'file',
  maxListeners: env.MAX_LISTENERS,
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
    // JIC 26.08 BUG #1# Los nombres deben coincidir con los exportados por
    // src/environment.ts (MONGO_*, no MONGODB_*), si no tsc falla en build.
    mongodbDatabase: env.MONGO_DATABASE,
    mongodbCollection: env.MONGO_COLLECTION,
    mongodbUser: env.MONGO_USER,
    mongodbPassword: env.MONGO_PASSWORD,
    mongodbHost: env.MONGO_HOST,
    // JIC 26.08 BUG #1# `|| true` anulaba el valor: false || true === true.
    mongoIsRemote: env.MONGO_IS_REMOTE,
    mongoURLRemote: env.MONGO_URL_REMOTE,
    mongodbPort: env.MONGO_PORT,
    redisHost: env.REDIS_HOST,
    redisPort: env.REDIS_PORT,
    redisPassword: env.REDIS_PASSWORD,
    redisDb: env.REDIS_DB,
    redisPrefix: env.REDIS_PREFIX,
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
