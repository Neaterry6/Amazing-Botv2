export default {
    config: {
        name: 'open',
        aliases: ['openchat', 'unlockgroup'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Open group — everyone can send messages',
        category: 'admin',
        coolDown: 5,
        role: 1,
        groupOnly: true,
        guide: { en: '{prefix}open' },
    },

    async onStart({ reply, sock, from, isGroupAdmin, isBotAdmin, React }) {
        React('🔓');
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);
        if (!isBotAdmin) return reply(`❌ The bot must be an admin.`);

        try {
            await sock.groupSettingUpdate(from, 'not_announcement');
            reply(`🔓 Group opened — everyone can send messages now.`);
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
