import fs from 'fs-extra';
import path from 'path';

const WORD_FILE = path.join(process.cwd(), 'data', 'badwords.json');
function loadWords() { try { return fs.readJsonSync(WORD_FILE); } catch { return {}; } }
function saveWords(w) { fs.ensureDirSync(path.dirname(WORD_FILE)); fs.writeJsonSync(WORD_FILE, w, { spaces: 2 }); }
function getWords(jid) { return loadWords()[jid] || { enabled: false, words: [] }; }

export default {
    config: {
        name: 'antiword',
        aliases: ['blockword', 'badwords'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Block specific words in the group',
        category: 'admin',
        coolDown: 3,
        role: 1,
        groupOnly: true,
        guide: {
            en: '{prefix}antiword on — enable\n{prefix}antiword off — disable\n{prefix}antiword add <word>\n{prefix}antiword remove <word>\n{prefix}antiword list'
        },
    },

    async onStart({ args, reply, from, isGroup, isGroupAdmin, React }) {
        React('🚫');
        if (!isGroup) return reply('Group only.');
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);
        const sub = args[0]?.toLowerCase();
        const store = loadWords();
        const cfg = store[from] || { enabled: false, words: [] };

        if (sub === 'on') {
            cfg.enabled = true;
            store[from] = cfg; saveWords(store);
            return reply(`🚫 *Antiword enabled.* Blocked words will be deleted.`);
        }
        if (sub === 'off') {
            cfg.enabled = false;
            store[from] = cfg; saveWords(store);
            return reply(`🚫 *Antiword disabled.*`);
        }
        if (sub === 'add') {
            const word = args.slice(1).join(' ').trim().toLowerCase();
            if (!word) return reply(`Usage: {prefix}antiword add <word>`);
            if (!cfg.words.includes(word)) cfg.words.push(word);
            cfg.enabled = true;
            store[from] = cfg; saveWords(store);
            return reply(`✅ Blocked word added: *${word}*\n\nBlocked list (${cfg.words.length}): ${cfg.words.join(', ')}`);
        }
        if (sub === 'remove' || sub === 'rm') {
            const word = args.slice(1).join(' ').trim().toLowerCase();
            if (!word) return reply(`Usage: {prefix}antiword remove <word>`);
            cfg.words = cfg.words.filter(w => w !== word);
            store[from] = cfg; saveWords(store);
            return reply(`🗑️ Removed: *${word}*\n\nRemaining (${cfg.words.length}): ${cfg.words.join(', ') || 'none'}`);
        }
        if (sub === 'list') {
            return reply(`🚫 *Blocked words* (${cfg.words.length}):\n\n${cfg.words.length ? cfg.words.map(w => `• ${w}`).join('\n') : 'None yet'}\n\nStatus: ${cfg.enabled ? '🟢 ON' : '🔴 OFF'}`);
        }

        return reply(`Usage:\n{prefix}antiword on|off\n{prefix}antiword add <word>\n{prefix}antiword remove <word>\n{prefix}antiword list`);
    },
};
