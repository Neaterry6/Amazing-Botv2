import { isDev } from '../../src/utils/devAccess.js';
import crypto from 'crypto';

const CIPHERS = ['aes-256-cbc', 'aes-256-gcm', 'aes-192-cbc', 'aes-128-cbc', 'camellia-256-cbc', 'des-ede3-cbc'];
const DEFAULT_SECRET = crypto.createHash('sha256').update(process.env.ENC_KEY || 'amazing-botv2').digest('hex').substring(0, 32);

export default {
    config: {
        name: 'cryptotool',
        aliases: ['ctool', 'cipher'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Advanced multi-cipher encryption tool (dev only)',
        category: 'owner',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}cryptotool enc <text> [cipher]\n{prefix}cryptotool dec <data> [cipher]\n{prefix}cryptotool list' },
    },

    async onStart({ args, reply, sender, React }) {
        React('🔐');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);

        if (args[0]?.toLowerCase() === 'list') {
            return reply(`🔐 *Available ciphers:*\n\n${CIPHERS.map(c => `▸ ${c}`).join('\n')}`);
        }

        const mode = args[0]?.toLowerCase();
        if (!mode || !['enc', 'encrypt', 'dec', 'decrypt'].includes(mode)) {
            return reply(`Usage:\n{prefix}cryptotool enc <text> [cipher]\n{prefix}cryptotool dec <data> [cipher]\n{prefix}cryptotool list`);
        }

        const encrypting = mode === 'enc' || mode === 'encrypt';
        const input = args.slice(1).filter(a => !CIPHERS.includes(a.toLowerCase())).join(' ');
        const cipherArg = args.slice(1).find(a => CIPHERS.includes(a.toLowerCase()));
        const algo = cipherArg || 'aes-256-cbc';

        try {
            const key = Buffer.from(DEFAULT_SECRET, 'utf8');
            const iv = crypto.randomBytes(16);

            if (encrypting) {
                if (!input) return reply(`❌ No text to encrypt.`);
                const cipher = crypto.createCipheriv(algo, key, iv);
                let enc = cipher.update(input, 'utf8', 'hex');
                enc += cipher.final('hex');
                const tag = algo.endsWith('gcm') ? cipher.getAuthTag().toString('hex') : '';
                const payload = `${algo}|${iv.toString('hex')}|${tag}|${enc}`;
                reply([
                    `━━━━━━━━━━━━━━━━━━━━`,
                    `  🔐 *CRYPTOTOOL ENC*`,
                    `━━━━━━━━━━━━━━━━━━━━`,
                    ``,
                    `  🧬 Cipher: ${algo}`,
                  `  📄 Input: ${input}`,
                    ``,
                    `  🔒 Output:`,
                    `  \`${payload}\``,
                    ``,
                    `  📌 Decrypt:`,
                    `  {prefix}cryptotool dec ${payload}`,
                    ``,
                    `━━━━━━━━━━━━━━━━━━━━`,
                ].join('\n'));
            } else {
                const parts = input.split('|');
                if (parts.length < 4) return reply(`❌ Invalid cipher payload.`);
                const [encAlgo, ivHex, tagHex, enc] = parts;
                const key2 = Buffer.from(DEFAULT_SECRET, 'utf8');
                const iv2 = Buffer.from(ivHex, 'hex');
                const decipher = crypto.createDecipheriv(encAlgo, key2, iv2);
                if (encAlgo.endsWith('gcm')) decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
                let dec = decipher.update(enc, 'hex', 'utf8');
                dec += decipher.final('utf8');
                reply([
                    `━━━━━━━━━━━━━━━━━━━━`,
                    `  🔓 *CRYPTOTOOL DEC*`,
                    `━━━━━━━━━━━━━━━━━━━━`,
                    ``,
                    `  🧬 Cipher: ${encAlgo}`,
                    `  📄 Decrypted:`,
                    `  ${dec}`,
                    ``,
                    `━━━━━━━━━━━━━━━━━━━━`,
                ].join('\n'));
            }
        } catch (err) {
            reply(`❌ Error: ${err.message}`);
        }
    },
};
