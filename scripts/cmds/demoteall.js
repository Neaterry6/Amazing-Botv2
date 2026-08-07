export default {
    config: {
        name: 'demoteall',
        aliases: ['removeadmins'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Demote all admins except the bot (dev only)',
        category: 'owner',
        coolDown: 30,
        role: 0,
        groupOnly: true,
        guide: { en: '{prefix}demoteall\n\nDemotes every admin except the bot itself.' },
    },

    async onStart({ reply, sock, from, sender, isGroup, isBotAdmin, React }) {
        React('💀');
        if (!isGroup) return reply('Group only.');
        if (!isBotAdmin) return reply('The bot must be an admin.');
        try {
            const meta = await sock.groupMetadata(from);
            const admins = meta.participants.filter(p => p.admin && p.id !== sock.user?.id);
            if (!admins.length) return reply(`Bot is already the only admin.`);
            const ids = admins.map(a => a.id);
            await sock.groupParticipantsUpdate(from, ids, 'demote');
            reply(`💀 Demoted ${admins.length} admin(s). Bot is now the only admin.`);
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
