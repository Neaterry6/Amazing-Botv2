import { isDev } from '../../src/utils/devAccess.js';
import crypto from 'crypto';

const ALGO = 'aes-256-cbc';
const SECRET = crypto.createHash('sha256').update(process.env.ENC_KEY || 'amazing-botv2').digest();

function encrypt(text, key = SECRET) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

export default {
    config: {
        name: 'encrypt',
        aliases: ['enc', 'encode'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Encrypt text/message (dev only)',
        category: 'owner',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}encrypt <text>' },
    },

    async onStart({ args, reply, sender, React }) {
        React('🔐');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);
        if (!args.length) return reply(`Usage: {prefix}encrypt <text>`);

        const text = args.join(' ').trim();
        try {
            const result = encrypt(text);
            reply([
                `━━━━━━━━━━━━━━━━━━━━`,
                `  🔐 *ENCRYPTED*`,
                `━━━━━━━━━━━━━━━━━━━━`,
                ``,
                `  📄 Original:`,
                `  ${text}`,
                ``,
                `  🔒 Cipher:`,
                `  \`${result}\``,
                ``,
                `  📌 Decrypt with:`,
                `  {prefix}decrypt ${result}`,
                ``,
                `━━━━━━━━━━━━━━━━━━━━`,
            ].join('\n'));
        } catch (err) {
            reply(`❌ Error: ${err.message}`);
        }
    },
};
