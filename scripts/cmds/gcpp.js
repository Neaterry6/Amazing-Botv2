export default {
    config: {
        name: 'gcpp',
        aliases: ['setgcpp', 'groupicon'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Change the group profile picture (reply to image)',
        category: 'admin',
        coolDown: 10,
        role: 1,
        groupOnly: true,
        guide: { en: '{prefix}gcpp — reply to an image' },
    },

    async onStart({ message, reply, sock, from, isGroupAdmin, isBotAdmin, React }) {
        React('🖼️');
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);
        if (!isBotAdmin) return reply(`❌ The bot must be an admin.`);

        const quoted = message?.message?.extendedTextMessage?.contextInfo?.message;
        const imgMsg = quoted?.imageMessage || message?.message?.imageMessage;
        if (!imgMsg) return reply(`Reply to an image or send one with this command.`);

        try {
            const { downloadMediaMessage } = await import('@whiskeysockets/baileys');
            const target = quoted ? { key: message.key, message: quoted } : message;
            const buffer = await downloadMediaMessage(target, 'buffer', {});
            await sock.updateProfilePicture(from, buffer);
            reply(`✅ Group profile picture updated!`);
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
