export default {
    config: {
        name: 'kick2',
        author: 'Broken_vzn',
        version: '2.0',
        shortDescription: 'Kick a user from the group',
        category: 'admin',
        groupOnly: true,
        coolDown: 3,
        role: 1,
        guide: { en: '{prefix}kick2 @user or reply to their message' },
    },
    async onStart({ args, reply, sock, from, message, isGroupAdmin, isBotAdmin, React }) {
        React('👢');
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);
        if (!isBotAdmin) return reply(`❌ The bot must be an admin.`);

        const ctx = message?.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctx?.mentionedJid?.[0];
        const quoted = ctx?.participant || ctx?.quotedMessage ? (ctx?.participant) : null;
        const target = mentioned || quoted || (args[0]?.replace(/[^0-9]/g, '') ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);

        if (!target) return reply(`Mention a user or reply to their message to kick.`);

        try {
            await sock.groupParticipantsUpdate(from, [target], 'remove');
            reply(`👢 Kicked @${target.split('@')[0]}`, { mentions: [target] });
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
