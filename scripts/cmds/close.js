export default {
    config: {
        name: 'close',
        aliases: ['closechat', 'lockgroup'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Close group — only admins can send messages',
        category: 'admin',
        coolDown: 5,
        role: 1,
        groupOnly: true,
        guide: { en: '{prefix}close' },
    },

    async onStart({ reply, sock, from, isGroupAdmin, isBotAdmin, React }) {
        React('🔒');
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);
        if (!isBotAdmin) return reply(`❌ The bot must be an admin.`);

        try {
            await sock.groupSettingUpdate(from, 'announcement');
            reply(`🔒 Group closed — only admins can send messages now.`);
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
