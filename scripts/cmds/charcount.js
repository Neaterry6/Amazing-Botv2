export default {
    config: {
        name: 'charcount',
        aliases: ['cc', 'length'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Count characters in text',
        category: 'utility',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}charcount <text>' },
    },

    async onStart({ args, reply, prefix, quoted, React }) {
        React('🔢');
        let text = '';
        if (quoted?.message?.conversation) text = quoted.message.conversation;
        else if (quoted?.message?.extendedTextMessage?.text) text = quoted.message.extendedTextMessage.text;
        else if (args.length) text = args.join(' ');

        if (!text) return reply(`Reply to a message or provide text.\nUsage: ${prefix}charcount <text>`);

        const words = text.split(/\s+/).filter(Boolean).length;
        const lines = text.split('\n').length;
        const chars = text.length;
        const noSpaces = text.replace(/\s/g, '').length;

        reply([
            `━━━━━━━━━━━━━━━━━━━━`,
            `  🔢 *CHARACTER COUNT*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            ``,
            `  📝 Characters: *${chars}*`,
            `  📝 No spaces: *${noSpaces}*`,
            `  📖 Words: *${words}*`,
            `  📄 Lines: *${lines}*`,
            ``,
            `━━━━━━━━━━━━━━━━━━━━`,
        ].join('\n'));
    },
};
