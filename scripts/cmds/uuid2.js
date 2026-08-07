export default {
    config: {
        name: 'uuid2',
        aliases: ['uid2', 'genuuid'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Generate UUID v4',
        category: 'utility',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}uuid2 [count]' },
    },
    async onStart({ args, reply, React }) {
        React('🆔');
        const count = Math.min(parseInt(args[0]) || 1, 10);
        let out = '🆔 *UUID v4*\n━━━━━━━━━━━━━━━━━━━━\n\n';
        for (let i = 0; i < count; i++) {
            out += `\`${genUuid()}\`\n\n`;
        }
        out += `━━━━━━━━━━━━━━━━━━━━`;
        reply(out);
    },
};

function genUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
