export default {
    config: {
        name: 'morse',
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Usage: .morse <text>',
        category: 'utility',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}morse <args>' },
    },
    async onStart({ args, reply, prefix, sender, from, message, React }) {
        React('⚡');
        
            if (!text) return reply('Usage: .morse <text>');
            const out = text.toLowerCase().split('').map(c => morseMap[c] || c).join(' ');
            reply(out);
        
    },
};
