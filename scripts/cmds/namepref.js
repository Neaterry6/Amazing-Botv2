import usersData from '../../src/utils/usersData.js';

export default {
    config: {
        name: 'namepref',
        aliases: ['setname', 'nickname', 'callme'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Set a preferred nickname for the bot to call you',
        category: 'utility',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}namepref <name>\n{prefix}namepref — view current\n{prefix}namepref reset — clear it' },
    },
    async onStart({ args, reply, sender, React }) {
        React('🏷️');
        const text = args.join(' ').trim();

        if (!text) {
            const user = await usersData.get(sender);
            const current = user?.vanity || user?.name;
            return reply(current ? `I'll call you *${current}*.` : `No nickname set.\n\nSet one: .namepref <name>`);
        }

        if (text.toLowerCase() === 'reset') {
            await usersData.set(sender, { vanity: null });
            return reply(`✅ Nickname cleared. I'll call you by your WhatsApp name.`);
        }

        if (text.length > 20) return reply(`❌ Nickname too long (max 20 chars).`);
        await usersData.set(sender, { vanity: text });
        reply(`✅ Got it, I'll call you *${text}* from now on. 😊`);
    },
};
