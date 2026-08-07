export default {
    config: {
        name: 'slowmode',
        aliases: ['slow'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Enable/disable slow mode (only admins chat)',
        category: 'admin',
        coolDown: 5,
        role: 1,
        groupOnly: true,
        guide: { en: '{prefix}slowmode on\n{prefix}slowmode off' },
    },

    async onStart({ args, reply, sock, from, isGroupAdmin, isBotAdmin, React }) {
        React('🐌');
        const mode = args[0]?.toLowerCase();
        if (!['on', 'off'].includes(mode)) return reply(`Usage: {prefix}slowmode on|off`);
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);
        if (!isBotAdmin) return reply(`❌ The bot must be an admin.`);

        try {
            if (mode === 'on') {
                await sock.groupSettingUpdate(from, 'announcement');
                reply(`🐌 Slow mode ON — only admins can send messages.`);
            } else {
                await sock.groupSettingUpdate(from, 'not_announcement');
                reply(`🐌 Slow mode OFF — everyone can send messages.`);
            }
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
