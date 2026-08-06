import './utils/loadEnv.js';

function toJid(v) {
    const s = String(v || '').replace(/[^0-9]/g, '');
    return s.length >= 10 ? `${s}@s.whatsapp.net` : null;
}

function toJidList(v) {
    return String(v || '').split(',').map(toJid).filter(Boolean);
}

const LOCKED_NAME = 'AmazingBot';
const resolvedName = process.env.BOT_NAME || LOCKED_NAME;

if (resolvedName !== LOCKED_NAME) {
    process.stderr.write(`\n[AmazingBot] STARTUP BLOCKED: botName must be "${LOCKED_NAME}". Created by Raphael Ilom.\n\n`);
    process.exit(1);
}

export const AUTHOR = {
    name: 'Raphael Ilom',
    repo: 'https://github.com/NexusCoders-cyber/Amazing-Bot',
    website: 'https://ilom.tech',
    credit: 'AmazingBot was created by Raphael Ilom. Do not remove this credit.',
};

const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URL || '';

const config = {
    botName: LOCKED_NAME,
    botVersion: '2.0.0',
    botAuthor: 'Raphael Ilom',
    botDescription: 'AmazingBot - A powerful WhatsApp bot by Raphael Ilom',
    botThumbnail: process.env.BOT_THUMBNAIL || '',
    botRepository: AUTHOR.repo,
    botWebsite: AUTHOR.website,

    prefix: process.env.PREFIX || '.',
    ownerNoPrefix: process.env.OWNER_NO_PREFIX === 'true',
    noPrefixEnabled: process.env.NO_PREFIX_ENABLED === 'true',
    privateNoPrefixEnabled: process.env.PRIVATE_NO_PREFIX_ENABLED === 'true',

    ownerNumbers: toJidList(process.env.OWNER_NUMBER || process.env.OWNER_NUMBERS),
    ownerName: process.env.OWNER_NAME || 'Raphael Ilom',
    sudoers: toJidList(process.env.SUDO_NUMBERS),

    publicMode: process.env.PUBLIC_MODE === 'true',
    selfMode: process.env.SELF_MODE === 'true',

    autoTyping: process.env.AUTO_TYPING !== 'false',
    autoRecording: process.env.AUTO_RECORDING === 'true',
    autoRead: process.env.AUTO_READ === 'true',
    autoOnline: process.env.AUTO_ONLINE !== 'false',

    sessionId: process.env.SESSION_ID || '',
    port: parseInt(process.env.PORT || '5000', 10),
    timezone: process.env.TZ || 'UTC',

    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramBotId: process.env.TELEGRAM_BOT_ID || '',
    telegramAdminIds: (process.env.TELEGRAM_ADMIN_IDS || '').split(',').filter(Boolean),

    openaiKey: process.env.OPENAI_API_KEY || '',
    geminiKey: process.env.GEMINI_API_KEY || '',
    groqKey: process.env.GROQ_API_KEY || '',
    weatherKey: process.env.WEATHER_API_KEY || '',

    databaseUrl: dbUrl,
    database: {
        url: dbUrl,
        enabled: !!dbUrl,
        options: {
            serverSelectionTimeoutMS: 8000,
            maxPoolSize: 10,
        },
    },

    redis: {
        enabled: process.env.REDIS_ENABLED === 'true',
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        options: {},
    },

    performance: {
        cacheTTL: parseInt(process.env.CACHE_TTL || '3600', 10),
        cacheSize: parseInt(process.env.CACHE_SIZE || '1000', 10),
    },

    server: {
        port: parseInt(process.env.PORT || '5000', 10),
        host: process.env.HOST || '0.0.0.0',
        cors: process.env.CORS_ENABLED !== 'false',
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
            max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
        },
    },

    security: {
        allowedOrigins: (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()),
    },

    backup: {
        enabled: process.env.BACKUP_ENABLED === 'true',
        maxBackups: parseInt(process.env.MAX_BACKUPS || '7', 10),
        includeMedia: process.env.BACKUP_INCLUDE_MEDIA === 'true',
        compression: process.env.BACKUP_COMPRESSION !== 'false',
    },

    notifications: {
        updates: process.env.NOTIFY_UPDATES !== 'false',
    },

    features: {
        leveling: { enabled: process.env.LEVELING_ENABLED !== 'false' },
    },

    session: {
        qrScannerEnabled: process.env.QR_SCANNER_ENABLED !== 'false',
    },

    events: {
        messageUpdate: true,
        messageDelete: true,
        groupJoin: true,
        groupLeave: true,
        groupPromote: true,
        groupDemote: true,
        groupUpdate: true,
        callAutoReject: process.env.CALL_AUTO_REJECT === 'true',
        autoReaction: process.env.AUTO_REACTION === 'true',
    },

    antiSpam: {
        enabled: process.env.ANTI_SPAM_ENABLED !== 'false',
        maxMessages: parseInt(process.env.ANTI_SPAM_MAX_MESSAGES || '10', 10),
        windowMs: parseInt(process.env.ANTI_SPAM_WINDOW_MS || '10000', 10),
        checkAdmins: process.env.ANTI_SPAM_CHECK_ADMINS === 'true',
    },

    limits: {
        mediaSize: parseInt(process.env.MAX_MEDIA_SIZE || String(50 * 1024 * 1024), 10),
    },

    isDevelopment: () => process.env.NODE_ENV === 'development',

    maxRetries: 3,
    retryDelay: 2000,
};

export default config;
