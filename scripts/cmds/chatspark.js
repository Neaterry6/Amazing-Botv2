import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { aiChat } from '../../src/utils/aiHelper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../../data/chatspark.json');

// Fallback debate questions if AI is unavailable
const FALLBACKS = [
    'If you could have dinner with any historical figure, who and why?',
    'Is pineapple on pizza acceptable? Debate.',
    'Which is better: dogs or cats? Fight me.',
    'If you could live in any fictional universe, where?',
    'Should the voting age be lowered to 16?',
    'If money was no object, what would you do with your life?',
    'Is a hotdog a sandwich? Defend your position.',
    'Would you rather lose all your memories or never make new ones?',
    'Is technology making us more or less connected?',
    'What is the best decade for music and why?',
    'Should social media require age verification?',
    'If you could instantly master one skill, what would it be?',
    'Is it better to be the smartest person in the room or the most interesting?',
    'Should we fear AI or embrace it?',
    'What is the most underrated movie of all time?',
];

function load() {
    try {
        fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
        return fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) : {};
    } catch { return {}; }
}
function save(d) {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(d, null, 2));
}
function isOn(groupId) {
    return !!load()[groupId]?.enabled;
}

export default {
    config: {
        name: 'chatspark',
        aliases: ['spark', 'debate'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Spark group debates — tags all with an AI question (on/off)',
        category: 'fun',
        coolDown: 5,
        role: 0,
        groupOnly: true,
        guide: {
            en: '{prefix}chatspark on — enable\n{prefix}chatspark off — disable\n{prefix}chatspark now — fire one now\n{prefix}chatspark status\n\nWhen ON, the bot randomly sparks a debate question every so often and tags all members.'
        },
    },

    async onStart({ args, reply, sock, from, message, isGroup, isGroupAdmin, React }) {
        React('💬');
        if (!isGroup) return reply('Group only.');
        const store = load();
        const sub = args[0]?.toLowerCase();

        if (sub === 'on') {
            if (!isGroupAdmin) return reply(`❌ Only group admins can enable ChatSpark.`);
            store[from] = { enabled: true, ts: Date.now() };
            save(store);
            return reply(`💬 *ChatSpark ON*\n\nI'll randomly drop debate questions and tag everyone.\n\nFire one now: {prefix}chatspark now`);
        }
        if (sub === 'off') {
            if (!isGroupAdmin) return reply(`❌ Only group admins can disable ChatSpark.`);
            delete store[from];
            save(store);
            return reply(`💬 ChatSpark turned off.`);
        }
        if (sub === 'status') {
            return reply(`💬 *ChatSpark status:* ${isOn(from) ? '🟢 ON' : '🔴 OFF'}\n\nTurn on: {prefix}chatspark on`);
        }
        if (sub === 'now' || !sub) {
            return fireQuestion(sock, from, message, reply);
        }

        return reply(`Usage: {prefix}chatspark on|off|now|status`);
    },
};

async function fireQuestion(sock, from, message, reply) {
    // Generate question via AI, fall back to random
    let question = '';
    try {
        const ai = await aiChat(
            'Generate ONE short, engaging, debatable question for a WhatsApp group chat to spark discussion. Make it fun and controversial but respectful. Reply with ONLY the question, no extra text, max 15 words.',
            [],
            'You generate debate questions for group chats.'
        );
        if (ai && ai.length < 100 && !ai.includes('AI API keys')) question = ai;
    } catch {}

    if (!question) question = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];

    try {
        const meta = await sock.groupMetadata(from);
        const members = meta.participants.map(p => p.id);
        const tags = members.map(m => `@${m.split('@')[0]}`).join(' ');
        await sock.sendMessage(from, {
            text: `💬 *CHAT SPARK*\n━━━━━━━━━━━━━━━━━━━━\n\n🤔 ${question}\n\n🗣️ Discuss! ${tags}\n━━━━━━━━━━━━━━━━━━━━`,
            mentions: members,
        }, { quoted: message });
    } catch (err) {
        reply(`❌ Failed: ${err.message}`);
    }
}
