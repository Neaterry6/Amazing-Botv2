export default {
    config: {
        name: 'admins',
        aliases: ['adminlist', 'alist'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'List all admins in the group',
        category: 'general',
        coolDown: 5,
        role: 0,
        groupOnly: true,
        guide: { en: '{prefix}admins' },
    },

    async onStart({ reply, sock, from, React }) {
        React('👑');
        try {
            const meta = await sock.groupMetadata(from);
            const admins = meta.participants.filter(p => p.admin);
            if (!admins.length) return reply(`No admins in this group.`);

            const superAdmins = admins.filter(a => a.superadmin);
            const regularAdmins = admins.filter(a => a.admin && !a.superadmin);

            let text = `👑 *Group Admins* — ${admins.length}\n━━━━━━━━━━━━━━━━━━━━\n\n`;
            if (superAdmins.length) {
                text += `👑 *Owner/Super Admin:*\n`;
                superAdmins.forEach(a => { text += `  ▸ ${a.id.split('@')[0]}\n`; });
                text += `\n`;
            }
            if (regularAdmins.length) {
                text += `🛡️ *Admins:*\n`;
                regularAdmins.forEach(a => { text += `  ▸ ${a.id.split('@')[0]}\n`; });
            }
            text += `\n━━━━━━━━━━━━━━━━━━━━`;
            reply(text);
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
