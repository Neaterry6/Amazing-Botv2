import { getAllEco, saveEcoName, fmtCoins } from '../../src/utils/economyDB.js';

export default {
    config: {
        name: 'rank',
        aliases: ['ranking', 'levels', 'xp'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'XP/level leaderboard',
        category: 'economy',
        coolDown: 10,
        role: 0,
        guide: { en: '{prefix}rank — top 10 by XP\n{prefix}rank <name> — find a user' },
    },

    async onStart({ args, reply, sender, pushName, React }) {
        React('🏆');
        const all = getAllEco();
        const entries = Object.entries(all).filter(([id, e]) => e.xp > 0 || e.level > 1);

        if (!entries.length) return reply(`🏆 No rankings yet. Chat and play games to earn XP!`);

        const search = args.join(' ').toLowerCase();
        let rows;

        if (search) {
            // Find user by name
            rows = entries
                .map(([id, e]) => ({ id, name: e.name || id, xp: e.xp, level: e.level }))
                .filter(u => u.name.toLowerCase().includes(search))
                .slice(0, 10);
            if (!rows.length) return reply(`❌ No user found matching "${args.join(' ')}".`);
        } else {
            // Top 10 by XP
            rows = entries
                .map(([id, e]) => ({ id, name: e.name || id, xp: e.xp, level: e.level }))
                .sort((a, b) => b.xp - a.xp)
                .slice(0, 10);
        }

        // Save my name
        saveEcoName(sender, pushName || sender);

        let out = `━━━━━━━━━━━━━━━━━━━━\n  🏆 *XP LEADERBOARD*\n━━━━━━━━━━━━━━━━━━━━\n\n`;

        const medals = ['🥇', '🥈', '🥉'];
        rows.forEach((u, i) => {
            const medal = medals[i] || `${i + 1}.`;
            out += `${medal} *${u.name}*\n`;
            out += `   Lv.${u.level} • ${fmtCoins(u.xp)} XP\n\n`;
        });

        out += `━━━━━━━━━━━━━━━━━━━━`;

        // Your rank
        if (!search) {
            const myRank = entries
                .map(([id, e]) => ({ id, xp: e.xp }))
                .sort((a, b) => b.xp - a.xp)
                .findIndex(u => u.id === String(sender).split('@')[0]);
            if (myRank !== -1) out += `\n\n📍 Your rank: *#${myRank + 1}* of ${entries.length}`;
        }

        reply(out);
    },
};
