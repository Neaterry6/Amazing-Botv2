import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../../data/group_welcome.json');

function load() {
    try {
        fs.ensureDirSync(path.dirname(DATA_PATH));
        return fs.existsSync(DATA_PATH) ? fs.readJsonSync(DATA_PATH) : {};
    } catch { return {}; }
}
function save(d) {
    fs.ensureDirSync(path.dirname(DATA_PATH));
    fs.writeJsonSync(DATA_PATH, d, { spaces: 2 });
}

export default {
    config: {
        name: 'setwelcome',
        aliases: ['swelcome', 'welcometext'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Set custom welcome message for new members',
        category: 'admin',
        coolDown: 5,
        role: 1,
        groupOnly: true,
        guide: {
            en: '{prefix}setwelcome <text>\n{prefix}setwelcome off — disable\n{prefix}setwelcome view — see current\n\nVariables: {user} (name), {count} (members), {gname} (group)'
        },
    },

    async onStart({ args, reply, from, isGroupAdmin, React }) {
        React('👋');
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);
        const store = load();

        if (args[0]?.toLowerCase() === 'view') {
            const cur = store[from]?.text;
            return reply(cur ? `👋 *Current welcome:*\n\n${cur}` : `No custom welcome set. Set one with: {prefix}setwelcome <text>`);
        }

        if (args[0]?.toLowerCase() === 'off' || args[0]?.toLowerCase() === 'disable') {
            delete store[from];
            save(store);
            return reply(`👋 Welcome message disabled.`);
        }

        const text = args.join(' ').trim();
        if (!text) return reply(`Usage: {prefix}setwelcome <text>\n\nVariables: {user}, {count}, {gname}`);

        store[from] = { text, ts: Date.now() };
        save(store);
        reply(`✅ Welcome message set:\n\n${text}`);
    },
};
