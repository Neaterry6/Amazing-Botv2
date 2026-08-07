export default {
    config: {
        name: 'setgdesc',
        aliases: ['sgdesc'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Set the group description',
        category: 'admin',
        coolDown: 5,
        role: 1,
        groupOnly: true,
        guide: { en: '{prefix}setgdesc <description>' },
    },

    async onStart({ args, reply, sock, from, isGroupAdmin, isBotAdmin, React }) {
        React('📝');
        const desc = args.join(' ').trim();
        if (!desc) return reply(`Usage: {prefix}setgdesc <description>`);
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);
        if (!isBotAdmin) return reply(`❌ The bot must be an admin.`);

        try {
            await sock.groupUpdateDescription(from, desc);
            reply(`✅ Group description updated.`);
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
