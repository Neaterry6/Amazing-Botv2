export default {
    config: {
        name: 'leave2',
        author: 'Broken_vzn',
        version: '2.0',
        shortDescription: 'Bot leaves the current group',
        category: 'owner',
        role: 2,
        coolDown: 3,
        guide: { en: '{prefix}leave2' },
    },
    async onStart({ reply, sock, from, React }) {
        React('👋');
        await reply('👋 Leaving group... Goodbye!');
        setTimeout(() => {
            try { sock.groupLeave(from); } catch {}
        }, 1500);
    },
};
