export default {
    config: {
        name: 'broadcast2',
        aliases: ['bc'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Broadcast message',
        category: 'owner',
        role: 2,
        coolDown: 3,
        role: 2,
        guide: { en: '{prefix}broadcast2 <args>' },
    },
    async onStart({ args, reply, prefix, sender, from, message, React }) {
        React('⚡');
        reply('📢 Broadcast: ' + args.join(' '));
    },
};
