import { isDev } from '../../src/utils/devAccess.js';

export default {
    config: {
        name: 'setgname',
        aliases: ['sgname'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Set the group name',
        category: 'admin',
        coolDown: 5,
        role: 1,
        groupOnly: true,
        guide: { en: '{prefix}setgname <new name>' },
    },

    async onStart({ args, reply, sock, from, isGroupAdmin, isBotAdmin, React }) {
        React('✏️');
        const name = args.join(' ').trim();
        if (!name) return reply(`Usage: {prefix}setgname <new name>`);
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);
        if (!isBotAdmin) return reply(`❌ The bot must be an admin.`);

        try {
            await sock.groupUpdateSubject(from, name);
            reply(`✅ Group name set to: *${name}*`);
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
