import { getAllEco, fmtCoins } from '../../src/utils/economyDB.js';
export default {
    config: { name: 'leaderboard', aliases: ['lb', 'rich', 'top'], author: 'Raphael Ilom', version: '1.0',
        shortDescription: 'Top 10 richest users', category: 'economy', coolDown: 10, role: 0,
        guide: { en: '{prefix}leaderboard' } },
    async onStart({ reply }) {
        const all = getAllEco();
        const sorted = Object.entries(all)
            .map(([id, eco]) => ({ id, net: (eco.wallet || 0) + (eco.bank || 0), name: eco.name || id }))
            .sort((a, b) => b.net - a.net).slice(0, 10);
        if (!sorted.length) return reply('No economy data yet.');
        const medals = ['🥇', '🥈', '🥉'];
        let text = 'Top 10 Richest Users\n\n';
        sorted.forEach((u, i) => {
            text += `${medals[i] || `${i + 1}.`} ${u.name} - ${fmtCoins(u.net)}\n`;
        });
        reply(text.trim());
    },
};
