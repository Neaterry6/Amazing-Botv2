export default {
    config: {
        name: 'groupstats',
        aliases: ['gstats', 'gcinfo'],
        author: 'Broken_vzn',
        version: '2.0',
        shortDescription: 'Show group statistics',
        category: 'admin',
        coolDown: 5,
        role: 0,
        groupOnly: true,
        guide: { en: '{prefix}groupstats' },
    },
    async onStart({ reply, sock, from, isGroup, React }) {
        React('📊');
        if (!isGroup) return reply('This command can only be used in groups.');
        try {
            const meta = await sock.groupMetadata(from);
            const participants = meta.participants || [];
            const admins = participants.filter(p => p.admin).length;
            const total = participants.length;
            const superAdmins = participants.filter(p => p.superadmin).length;
            const created = meta.creation ? new Date(meta.creation * 1000).toLocaleDateString() : 'Unknown';

            reply([
                `━━━━━━━━━━━━━━━━━━━━`,
                `  📊 *GROUP STATS*`,
                `━━━━━━━━━━━━━━━━━━━━`,
                ``,
                `  👥 Total members: *${total}*`,
                `  🛡️ Admins: *${admins}*`,
                `  👑 Super admins: *${superAdmins}*`,
                `  🙋 Regular: *${total - admins}*`,
                `  📅 Created: ${created}`,
                ``,
                `  📛 Name: ${meta.subject || 'Unknown'}`,
                `  🆔 ${from.split('@')[0]}`,
                ``,
                `━━━━━━━━━━━━━━━━━━━━`,
            ].join('\n'));
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
