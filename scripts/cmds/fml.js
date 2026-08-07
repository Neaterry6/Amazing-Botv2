export default {
    config: {
        name: 'fml',
        aliases: ['fail', 'fmlife'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Random "F my life" moment',
        category: 'fun',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}fml' },
    },
    async onStart({ reply, React }) {
        React('😔');
        const f = [
            'Today I realized I have been waving at a stranger for 5 minutes',
            'I sent a love text to my boss instead of my girlfriend',
            'I walked into a glass door in front of my crush',
            'I accidentally liked my ex 3 year old photo',
            'I said "you too" when the waiter said enjoy your meal',
            'I put my keys in the fridge and spent an hour looking for them',
            'I waved back at a person waving at someone behind me',
            'My phone autocorrected "see you soon" to "see you son"',
        ];
        const pick = f[Math.floor(Math.random() * f.length)];
        reply(`😔 *FML:*\n\n${pick}\n\n— F my life 😭`);
    },
};
