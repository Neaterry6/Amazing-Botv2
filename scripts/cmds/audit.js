import { isDev } from '../../src/utils/devAccess.js';
import fs from 'fs';
import path from 'path';

export default {
    config: {
        name: 'audit',
        aliases: ['cmdstats', 'stats'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Audit all commands by category (dev only)',
        category: 'owner',
        coolDown: 10,
        role: 0,
        guide: { en: '{prefix}audit' },
    },

    async onStart({ reply, sender, React }) {
        React('📊');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);

        const cmdsDir = path.join(process.cwd(), 'scripts', 'cmds');
        let files = [];
        try { files = fs.readdirSync(cmdsDir).filter(f => f.endsWith('.js') && !f.includes('.eg.')); } catch {}

        const categories = {};
        let total = 0;

        for (const file of files) {
            const fp = path.join(cmdsDir, file);
            let content = '';
            try { content = fs.readFileSync(fp, 'utf8'); } catch { continue; }

            // Extract category
            const catMatch = content.match(/category:\s*['"]([^'"]+)['"]/);
            const cat = catMatch ? catMatch[1] : 'misc';

            // Check if dev-only
            const isDev = content.includes('devAccess') || content.includes('Developer-only');

            if (!categories[cat]) categories[cat] = { total: 0, dev: 0 };
            categories[cat].total++;
            if (isDev) categories[cat].dev++;
            total++;
        }

        const sorted = Object.entries(categories).sort((a, b) => b[1].total - a[1].total);

        let out = `━━━━━━━━━━━━━━━━━━━━\n  📊 *COMMAND AUDIT*\n━━━━━━━━━━━━━━━━━━━━\n\n  🗂️ Total: *${total}* commands\n\n`;
        for (const [cat, c] of sorted) {
            const icon = cat.toLowerCase().includes('game') ? '🎮'
                : cat.toLowerCase().includes('fun') ? '🎭'
                : cat.toLowerCase().includes('owner') ? '👑'
                : cat.toLowerCase().includes('ai') ? '🤖'
                : cat.toLowerCase().includes('eco') ? '💰'
                : cat.toLowerCase().includes('admin') ? '🛡️'
                : cat.toLowerCase().includes('util') ? '🔧'
                : cat.toLowerCase().includes('down') ? '📥'
                : cat.toLowerCase().includes('edit') ? '🎨'
                : '📁';
            out += `${icon} ${cat}: *${c.total}*`;
            if (c.dev) out += ` (${c.dev} dev)`;
            out += `\n`;
        }
        out += `\n━━━━━━━━━━━━━━━━━━━━`;
        reply(out);
    },
};
