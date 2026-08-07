export default {
    config: {
        name: 'base64',
        aliases: ['b64', 'encode', 'decode'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Base64 encode/decode text',
        category: 'utility',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}base64 <encode|decode> <text>' },
    },

    async onStart({ args, reply, prefix, React }) {
        React('🔐');
        if (args.length < 2) return reply(`Usage: ${prefix}base64 <encode|decode> <text>`);

        const mode = args[0].toLowerCase();
        const text = args.slice(1).join(' ');

        try {
            if (mode === 'encode') {
                const result = Buffer.from(text).toString('base64');
                reply(`🔐 *Encoded:*\n\`${result}\``);
            } else if (mode === 'decode') {
                const result = Buffer.from(text, 'base64').toString('utf8');
                reply(`🔓 *Decoded:*\n${result}`);
            } else {
                reply(`Use *encode* or *decode*.\nUsage: ${prefix}base64 encode Hello`);
            }
        } catch {
            reply(`❌ Invalid input for ${mode} operation.`);
        }
    },
};
