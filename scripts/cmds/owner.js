export default {
    config: {
        name: 'owner',
        aliases: ['groupowner', 'getowner'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Find the group owner',
        category: 'general',
        coolDown: 5,
        role: 0,
        groupOnly: true,
        guide: { en: '{prefix}owner' },
    },

    async onStart({ reply, sock, from, React }) {
        React('👑');
        try {
            const meta = await sock.groupMetadata(from);
            const ownerId = meta.owner;
            const superAdmins = meta.participants.filter(p => p.superadmin);

            // Owner might not be in participants list on some platforms
            const owner = superAdmins.find(s => s.id === ownerId) || meta.participants.find(p => p.id === ownerId);

            let text = `👑 *Group Owner*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
            if (owner) {
                text += `  👤 @${ownerId?.split('@')[0] || 'unknown'}\n`;
            } else if (ownerId) {
                text += `  👤 @${ownerId.split('@')[0]}\n`;
            } else {
                text += `  🔍 Owner not exposed by WhatsApp for this group.\n  🛡️ Super admins:\n`;
                superAdmins.forEach(s => { text += `  ▸ @${s.id.split('@')[0]}\n`; });
            }
            text += `\n━━━━━━━━━━━━━━━━━━━━`;
            reply(text, ownerId ? [ownerId] : []);
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
