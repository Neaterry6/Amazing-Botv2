import { getEco, fmtCoins, addXp } from '../../src/utils/economyDB.js';

const giveaways = new Map();

export default {
    config: {
        name: 'giveaway',
        aliases: ['gaw', 'gv'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Host a giveaway and auto-pick a winner',
        category: 'fun',
        coolDown: 5,
        role: 0,
        groupOnly: true,
        guide: {
            en: '{prefix}giveaway <prize>\n{prefix}giveaway start — open entries\n{prefix}giveaway join — enter\n{prefix}giveaway end — pick winner\n{prefix}giveaway cancel'
        },
    },

    async onStart({ args, reply, from, sender, isGroupAdmin, pushName, React }) {
        React('🎉');
        const sub = args[0]?.toLowerCase();

        // Start a giveaway
        if (sub === 'start' || !sub) {
            if (giveaways.has(from)) {
                const g = giveaways.get(from);
                return reply(`🎉 A giveaway is already running!\n\n🎁 Prize: *${g.prize}*\n👥 Entries: ${g.entries.size}\n\nReply with ${args[0] ? '' : '.'}giveaway join to enter, or .giveaway end to pick a winner.`);
            }

            const prize = args.slice(sub === 'start' ? 1 : 0).join(' ') || 'Mystery Prize 🎁';
            giveaways.set(from, {
                prize,
                entries: new Set(),
                host: sender,
                startTime: Date.now(),
            });
            return reply([
                `━━━━━━━━━━━━━━━━━━━━`,
                `  🎉 *GIVEAWAY STARTED*`,
                `━━━━━━━━━━━━━━━━━━━━`,
                ``,
                `  🎁 Prize: *${prize}*`,
                `  🕐 Started just now`,
                ``,
                `  To enter: *.giveaway join*`,
                `  To end: *.giveaway end*`,
                ``,
                `━━━━━━━━━━━━━━━━━━━━`,
            ].join('\n'));
        }

        // Join
        if (sub === 'join') {
            const g = giveaways.get(from);
            if (!g) return reply(`❌ No active giveaway in this group. Start one with: .giveaway start`);
            if (g.entries.has(sender)) return reply(`You've already entered! 🎉`);
            g.entries.add(sender);
            return reply(`✅ You're in! 🎉\n\nTotal entries: *${g.entries.size}*`);
        }

        // End
        if (sub === 'end') {
            const g = giveaways.get(from);
            if (!g) return reply(`❌ No active giveaway.`);
            if (!isGroupAdmin && g.host !== sender) return reply(`❌ Only the host or an admin can end the giveaway.`);

            giveaways.delete(from);

            if (!g.entries.size) {
                return reply(`❌ No entries. Giveaway cancelled.`);
            }

            const winnerId = [...g.entries][Math.floor(Math.random() * g.entries.size)];
            const eco = getEco(winnerId);
            const name = eco?.name || winnerId.split('@')[0];

            // Reward winner with XP
            addXp(eco, 50);

            return reply([
                `━━━━━━━━━━━━━━━━━━━━`,
                `  🎉 *GIVEAWAY ENDED*`,
                `━━━━━━━━━━━━━━━━━━━━`,
                ``,
                `  🎁 Prize: *${g.prize}*`,
                `  👥 Entries: ${g.entries.size}`,
                ``,
                `  🏆 WINNER:`,
                `  *${name}* 🎊🎉`,
                ``,
                `  +50 XP bonus!`,
                `  ${winnerId.includes('@') ? `@${winnerId.split('@')[0]}` : ''}`,
                ``,
                `━━━━━━━━━━━━━━━━━━━━`,
            ].join('\n'), winnerId.includes('@') ? [winnerId] : []);
        }

        // Cancel
        if (sub === 'cancel') {
            const g = giveaways.get(from);
            if (!g) return reply(`❌ No active giveaway.`);
            if (!isGroupAdmin && g.host !== sender) return reply(`❌ Only the host or an admin can cancel.`);
            giveaways.delete(from);
            return reply(`🗑️ Giveaway cancelled.`);
        }

        reply(`Unknown option. Try: start, join, end, cancel`);
    },
};
