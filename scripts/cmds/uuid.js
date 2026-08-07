import { getEco, saveEco, fmtCoins } from '../../src/utils/economyDB.js';

export default {
    config: {
        name: 'uuid',
        aliases: ['uid'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Generate a UUID',
        category: 'utility',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}uuid [count]' },
    },

    async onStart({ args, reply, prefix, React }) {
        React('🆔');

        const count = Math.min(parseInt(args[0]) || 1, 10);

        const genUUID = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        };

        let text = `━━━━━━━━━━━━━━━━━━━━\n  🆔 *UUID Generator*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
        for (let i = 0; i < count; i++) {
            text += `\`${genUUID()}\`\n`;
        }
        text += `\n━━━━━━━━━━━━━━━━━━━━`;
        reply(text);
    },
};
