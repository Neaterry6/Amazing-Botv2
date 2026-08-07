import { isDev } from '../../src/utils/devAccess.js';
import crypto from 'crypto';

const ALGO = 'aes-256-cbc';
const SECRET = crypto.createHash('sha256').update(process.env.ENC_KEY || 'amazing-botv2').digest();

function decrypt(encoded, key = SECRET) {
    const [ivHex, encrypted] = encoded.split(':');
    if (!ivHex || !encrypted) throw new Error('Invalid encrypted format');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export default {
    config: {
        name: 'decrypt',
        aliases: ['dec', 'decode'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Decrypt a message (dev only)',
        category: 'owner',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}decrypt <ciphertext>' },
    },

    async onStart({ args, reply, sender, React }) {
        React('🔓');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);
        if (!args.length) return reply(`Usage: {prefix}decrypt <ciphertext>`);

        const input = args.join(' ').trim();
        try {
            const result = decrypt(input);
            reply([
                `━━━━━━━━━━━━━━━━━━━━`,
                `  🔓 *DECRYPTED*`,
                `━━━━━━━━━━━━━━━━━━━━`,
                ``,
                `  📄 Original text:`,
                `  ${result}`,
                ``,
                `━━━━━━━━━━━━━━━━━━━━`,
            ].join('\n'));
        } catch (err) {
            reply(`❌ Decryption failed. Invalid ciphertext or wrong key.\n\n${err.message}`);
        }
    },
};
