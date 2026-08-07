export default {
    config: {
        name: 'mute2',
        author: 'Broken_vzn',
        version: '2.0',
        shortDescription: 'Mute group — only admins can send',
        category: 'admin',
        groupOnly: true,
        coolDown: 3,
        role: 1,
        guide: { en: '{prefix}mute2' },
    },
    async onStart({ reply, sock, from, isGroupAdmin, isBotAdmin, React }) {
        React('🔇');
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);
        if (!isBotAdmin) return reply(`❌ The bot must be an admin.`);
        try {
            await sock.groupSettingUpdate(from, 'announcement');
            reply(`🔇 Group muted — only admins can send messages.`);
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
