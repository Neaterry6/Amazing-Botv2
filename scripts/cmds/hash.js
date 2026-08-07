import { createHash } from 'crypto';

export default {
    config: {
        name: 'hash',
        aliases: ['md5', 'sha256'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Hash text with md5/sha256',
        category: 'utility',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}hash <md5|sha256> <text>' },
    },

    async onStart({ args, reply, prefix, React }) {
        React('🔐');
        if (args.length < 2) return reply(`Usage: ${prefix}hash <md5|sha256> <text>`);

        const algo = args[0].toLowerCase();
        const text = args.slice(1).join(' ');

        if (!['md5', 'sha256', 'sha1'].includes(algo)) {
            return reply(`Supported algorithms: md5, sha1, sha256`);
        }

        const hash = createHash(algo).update(text).digest('hex');
        reply(`🔐 *${algo.toUpperCase()} Hash:*\n\`${hash}\``);
    },
};
