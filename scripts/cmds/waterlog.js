import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../../data/water.json');

function load() {
    try {
        fs.ensureDirSync(path.dirname(DATA_PATH));
        return fs.existsSync(DATA_PATH) ? fs.readJsonSync(DATA_PATH) : {};
    } catch { return {}; }
}

function save(data) {
    fs.ensureDirSync(path.dirname(DATA_PATH));
    fs.writeJsonSync(DATA_PATH, data, { spaces: 2 });
}

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

export default {
    config: {
        name: 'waterlog',
        aliases: ['water', 'drink'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Log your water intake (default 250ml)',
        category: 'health',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}waterlog <ml>\n{prefix}waterlog — log 250ml default\n{prefix}waterlog today — view today' },
    },
    async onStart({ args, reply, sender, React }) {
        React('💧');
        const data = load();

        if (args[0]?.toLowerCase() === 'today') {
            const today = todayStr();
            const total = data[sender]?.[today] || 0;
            return reply(`💧 *Today's water intake:*\n\n${total}ml / 2500ml (${Math.round((total / 2500) * 100)}%)\n\n${'▰'.repeat(Math.min(20, Math.round(total / 125)))}${'▱'.repeat(Math.max(0, 20 - Math.round(total / 125)))}`);
        }

        const amount = parseInt(args[0]) || 250;
        if (amount <= 0 || amount > 5000) return reply(`❌ Invalid amount. Use 1-5000ml.`);

        if (!data[sender]) data[sender] = {};
        const today = todayStr();
        data[sender][today] = (data[sender][today] || 0) + amount;
        save(data);

        const total = data[sender][today];
        reply(`💧 *Logged ${amount}ml*\n\nToday's total: *${total}ml* / 2500ml (${Math.round((total / 2500) * 100)}%)\n\n${'▰'.repeat(Math.min(20, Math.round(total / 125)))}${'▱'.repeat(Math.max(0, 20 - Math.round(total / 125)))}`);
    },
};
