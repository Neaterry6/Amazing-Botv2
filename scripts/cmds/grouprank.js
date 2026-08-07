import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../../data/activity.json');

function loadActivity() {
    try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); }
    catch { return {}; }
}

export default {
    config: {
        name: 'grouprank',
        aliases: ['grank', 'activityrank', 'activeleaderboard'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Rank members by message activity',
        category: 'admin',
        coolDown: 10,
        role: 0,
        groupOnly: true,
        guide: { en: '{prefix}grouprank — top 10 most active' },
    },

    async onStart({ reply, sock, from, isGroup, React }) {
        React('📊');
        if (!isGroup) return reply('Group only.');
        try {
            const meta = await sock.groupMetadata(from);
            const members = meta.participants.map(p => p.id);

            const activity = loadActivity()[from] || {};
            const rows = members
                .map(id => ({ id, lastTs: activity[id.split('@')[0]] || 0 }))
                .filter(r => r.lastTs > 0)
                .sort((a, b) => b.lastTs - a.lastTs)
                .slice(0, 10);

            if (!rows.length) return reply(`📊 No activity tracked yet. Members need to chat first!`);

            const now = Date.now();
            let text = `📊 *MOST ACTIVE MEMBERS*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
            const medals = ['🥇', '🥈', '🥉'];
            rows.forEach((r, i) => {
                const mins = Math.floor((now - r.lastTs) / 60000);
                const timeStr = mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
                text += `${medals[i] || `${i + 1}.`} @${r.id.split('@')[0]}\n`;
                text += `   └ Last active: ${timeStr}\n\n`;
            });
            text += `━━━━━━━━━━━━━━━━━━━━`;
            reply(text);
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
