import { isDev } from '../../src/utils/devAccess.js';
import crypto from 'crypto';

export default {
    config: {
        name: 'hash',
        aliases: ['digest'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Hash text with multiple algorithms (dev only)',
        category: 'owner',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}hash <text>' },
    },

    async onStart({ args, reply, sender, React }) {
        React('#️⃣');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);
        if (!args.length) return reply(`Usage: {prefix}hash <text>`);

        const text = args.join(' ');
        const algos = ['md5', 'sha1', 'sha256', 'sha512'];

        let out = `━━━━━━━━━━━━━━━━━━━━\n  #️⃣ *HASHES*\n━━━━━━━━━━━━━━━━━━━━\n\n📄 Input: ${text}\n\n`;
        for (const algo of algos) {
            const h = crypto.createHash(algo).update(text).digest('hex');
            out += `▸ *${algo.toUpperCase()}:*\n  ${h}\n\n`;
        }
        out += `━━━━━━━━━━━━━━━━━━━━`;
        reply(out);
    },
};
