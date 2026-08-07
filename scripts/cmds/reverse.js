export default {
    config: {
        name: 'reverse',
        aliases: [],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Reverse text',
        category: 'utility',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}reverse <text>' },
    },

    async onStart({ args, reply, prefix, quoted, React }) {
        React('🔄');
        let text = '';
        if (quoted?.message?.conversation) text = quoted.message.conversation;
        else if (quoted?.message?.extendedTextMessage?.text) text = quoted.message.extendedTextMessage.text;
        else if (args.length) text = args.join(' ');

        if (!text) return reply(`Usage: ${prefix}reverse <text>\nOr reply to a message.`);

        reply(`🔄 *Reversed:*\n${text.split('').reverse().join('')}`);
    },
};
