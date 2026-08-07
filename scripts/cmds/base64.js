import { isDev } from '../../src/utils/devAccess.js';

export default {
    config: {
        name: 'base64',
        aliases: ['b64', 'b64enc', 'b64dec'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Encode/decode Base64 (dev only)',
        category: 'owner',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}base64 enc <text> | {prefix}base64 dec <encoded>' },
    },

    async onStart({ args, reply, sender, React }) {
        React('🔤');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);
        if (args.length < 2) return reply(`Usage:\n{prefix}base64 enc <text>\n{prefix}base64 dec <encoded>`);

        const mode = args[0].toLowerCase();
        const input = args.slice(1).join(' ');

        try {
            if (mode === 'enc' || mode === 'encode' || mode === 'e') {
                const out = Buffer.from(input, 'utf8').toString('base64');
                reply(`🔤 *Base64 Encode*\n\n📄 Input: ${input}\n\n🔑 Output:\n\`${out}\``);
            } else if (mode === 'dec' || mode === 'decode' || mode === 'd') {
                const out = Buffer.from(input, 'base64').toString('utf8');
                reply(`🔤 *Base64 Decode*\n\n📄 Input: ${input}\n\n📄 Output:\n\`${out}\``);
            } else {
                reply(`Unknown mode. Use "enc" or "dec".`);
            }
        } catch (err) {
            reply(`❌ Error: ${err.message}`);
        }
    },
};
