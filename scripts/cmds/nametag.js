export default {
    config: {
        name: 'nametag',
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: '🏷️ Show your name tag',
        category: 'general',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}nametag <args>' },
    },
    async onStart({ args, reply, prefix, sender, from, message, React }) {
        React('⚡');
        
            reply(`🏷️ @${sender.split('@')[0]}`);
        
    },
};
