export default {
    config: {
        name: 'unscramble',
        aliases: ['scrambleword'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Unscramble a word',
        category: 'fun',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}unscramble' },
    },
    async onStart({ reply, from, React }) {
        React('🔤');
        const words = ['javascript','python','developer','algorithm','database','function','variable','terminal','keyboard','internet','computer','network','software','hardware','bluetooth','compiler','frontend','backend','browser'];
        const w = words[Math.floor(Math.random() * words.length)];
        const s = w.split('').sort(() => Math.random() - 0.5).join('');
        global._uns = global._uns || {};
        global._uns[from] = w;
        reply(`🔤 *Unscramble:*\n\n\`${s}\`\n\nReply with your answer!`);
    },
};
