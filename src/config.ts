import { ServerOptions } from './types/ServerOptions';
import { environment } from './environment';

export default {
  secretKey: environment.SECRET_KEY,
  host: environment.HOST,
  port: environment.PORT,
  deviceName: 'Google Chrome',
  poweredBy: 'Google Chrome',
  startAllSession: true,
  tokenStoreType: environment.TOKEN_STORE_TYPE,
  maxListeners: 15,
  customUserDataDir: environment.USER_DATA_DIR,

  webhook: {
    url: null,
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
    waitForLogin: true,
    puppeteerOptions: {
      protocolTimeout: 120000,
    },
    browserArgs: [
      // Sandbox (requerido en Docker)
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',

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
    mongodbDatabase: environment.MONGO_DATABASE,
    mongodbCollection: environment.MONGO_COLLECTION,
    mongodbUser: environment.MONGO_USER,
    mongodbPassword: environment.MONGO_PASSWORD,
    mongodbHost: environment.MONGO_HOST,
    mongodbPort: environment.MONGO_PORT,
    mongoIsRemote: environment.MONGO_IS_REMOTE,
    mongoURLRemote: environment.MONGO_URL_REMOTE,
    redisHost: environment.REDIS_HOST,
    redisPort: environment.REDIS_PORT,
    redisPassword: environment.REDIS_PASSWORD,
    redisDb: environment.REDIS_DB,
    redisPrefix: environment.REDIS_PREFIX,
  },

  aws_s3: {
    region: environment.AWS_REGION as any,
    access_key_id: environment.AWS_ACCESS_KEY_ID,
    secret_key: environment.AWS_SECRET_KEY,
    defaultBucketName: environment.AWS_BUCKET_NAME,
    endpoint: environment.AWS_ENDPOINT,
    forcePathStyle: environment.AWS_FORCE_PATH_STYLE,
  },
} as unknown as ServerOptions;
