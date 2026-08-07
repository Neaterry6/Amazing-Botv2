import { getEco, fmtCoins } from '../../src/utils/economyDB.js';

export default {
    config: {
        name: 'backpack',
        aliases: ['pack'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'View your backpack (wallet, bank, inventory)',
        category: 'economy',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}backpack' },
    },
    async onStart({ sender, reply, pushName }) {
        const eco = getEco(sender);
        const inv = eco.inventory || [];

        // Group inventory
        const grouped = {};
        inv.forEach(item => { grouped[item] = (grouped[item] || 0) + 1; });
        const invLines = Object.entries(grouped).map(([item, count]) => `  • ${item} x${count}`);

        let text = `🎒 *Backpack — ${pushName || 'User'}*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `💰 Wallet: *${fmtCoins(eco.wallet || 0)}*\n`;
        text += `🏦 Bank: *${fmtCoins(eco.bank || 0)}*\n`;
        text += `💎 Diamonds: *${eco.diamonds || 0}*\n`;
        text += `⭐ Stars: *${eco.stars || 0}*\n`;
        text += `📈 Level: *${eco.level || 1}* (${eco.xp || 0} XP)\n\n`;
        text += `🎒 Inventory:\n${invLines.length ? invLines.join('\n') : '  _Empty — buy items from .shop_'}\n`;
        text += `━━━━━━━━━━━━━━━━━━━━`;

        reply(text);
    },
};
