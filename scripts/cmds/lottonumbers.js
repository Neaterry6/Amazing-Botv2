export default {
    config: {
        name: 'lottonumbers',
        aliases: ['lotto', 'luckynums'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Generate 6 random lottery numbers',
        category: 'fun',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}lottonumbers' },
    },
    async onStart({ reply, React }) {
        React('🎟️');
        const nums = new Set();
        while (nums.size < 6) nums.add(Math.floor(Math.random() * 49) + 1);
        const sorted = [...nums].sort((a, b) => a - b);
        reply(`🎟️ *Your lucky numbers:*\n\n${sorted.join('  ·  ')}\n\nGood luck! 🍀`);
    },
};
