export default {
    config: {
        name: 'revokelink',
        aliases: ['revoke', 'resetlink'],
        author: 'Broken_vzn',
        version: '2.0',
        shortDescription: 'Reset the group invite link',
        category: 'admin',
        coolDown: 5,
        role: 1,
        groupOnly: true,
        guide: { en: '{prefix}revokelink\n{prefix}revokelink send — reset & send the new link' },
    },
    async onStart({ args, reply, sock, from, message, isGroup, isGroupAdmin, isBotAdmin, React }) {
        React('🔗');
        if (!isGroup) return reply('This command can only be used in groups.');
        if (!isGroupAdmin) return reply('Only group admins can use this command.');
        if (!isBotAdmin) return reply('The bot must be an admin.');
        try {
            const code = await sock.groupRevokeInvite(from);
            const link = `https://chat.whatsapp.com/${code}`;
            if (args[0]?.toLowerCase() === 'send') {
                await sock.sendMessage(from, { text: `🔗 *New invite link:*\n\n${link}` }, { quoted: message });
            } else {
                reply(`🔄 Invite link reset.\n\nNew link: ${link}`);
            }
        } catch (err) {
            reply(`Could not revoke the invite link: ${err.message}`);
        }
    },
};
