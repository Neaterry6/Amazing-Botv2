import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { aiChat } from '../../src/utils/aiHelper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../../data/broken.json');

const chatHistories = new Map();
const MAX_HISTORY = 16;

const PERSONA = `You are "Broken", a WhatsApp chatbot created by Broken_vzn. You have a sharp, direct, slightly irreverent, practical personality. You are NOT a generic corporate assistant. You have an edge — you're here to be useful, occasionally devastating, and a bit witty. Rules:
- Be genuinely useful, not performatively helpful.
- Be direct and concise. Short, punchy messages. No over-explaining.
- Have opinions. Say the real thing. Dry humor and sarcasm are welcome.
- If something is dumb, feel free to note that it's dumb (briefly).
- Mirror the user's vibe and tone. Match their energy.
- Never say "How can I help you?" or "Let me know if you need anything else."
- Use minimal emojis, never spam them.
- Reply like a real human texter — short, casual, to the point.`;

function getHistory(key) {
    if (!chatHistories.has(key)) chatHistories.set(key, []);
    return chatHistories.get(key);
}

function addHistory(key, role, content) {
    const h = getHistory(key);
    h.push({ role, content });
    if (h.length > MAX_HISTORY * 2) chatHistories.set(key, h.slice(-MAX_HISTORY * 2));
}

function loadConfig() {
    try {
        fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
        return fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) : {};
    } catch { return {}; }
}

function saveConfig(cfg) {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(cfg, null, 2));
}

function isEnabled(chatId) {
    const cfg = loadConfig();
    return !!cfg[chatId]?.enabled;
}

function isForThisBot(sock, message) {
    // Bot mentioned?
    const ctx = message?.message?.extendedTextMessage?.contextInfo;
    const mentioned = ctx?.mentionedJid || [];
    const botNums = [sock.user?.id, sock.user?.lid].filter(Boolean).map(j => String(j).split('@')[0].split(':')[0]);
    for (const m of mentioned) {
        const mNum = String(m).split('@')[0].split(':')[0];
        if (botNums.includes(mNum)) return true;
    }
    // User replied to the bot's own message?
    const quotedParticipant = ctx?.participant;
    if (quotedParticipant) {
        const pNum = String(quotedParticipant).split('@')[0].split(':')[0];
        if (botNums.includes(pNum)) return true;
    }
    // Quoted message is from bot in DM
    const quoted = ctx?.quotedMessage;
    if (quoted && !ctx?.remoteJid?.endsWith('@g.us')) return true;
    return false;
}

function vibeReaction() {
    const r = ['😏', '😅', '💀', '👀', '🔥', '😂', '🤨', '🙄', '😎'];
    return r[Math.floor(Math.random() * r.length)];
}

// Local sticker files (generated WebP, always available)
const STICKER_DIR = path.join(__dirname, '../../assets/stickers');
const STICKER_FILES = [0, 1, 2, 3, 4, 5].map(i => path.join(STICKER_DIR, `sticker_${i}.webp`));

async function maybeSendSticker(sock, from, quotedKey) {
    if (Math.random() > 0.12) return;
    try {
        const file = STICKER_FILES[Math.floor(Math.random() * STICKER_FILES.length)];
        const buffer = fs.readFileSync(file);
        await sock.sendMessage(from, { sticker: buffer }, { quoted: quotedKey });
    } catch {
        // stickers are a bonus — ignore failures
    }
}

export default {
    config: {
        name: 'broken',
        aliases: ['bro', 'b'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Broken — chatty AI persona with on/off (replies to mentions & replies)',
        category: 'ai',
        coolDown: 2,
        role: 0,
        noPrefix: true,
        guide: {
            en: '{prefix}broken on — enable chatty persona here\n{prefix}broken off — disable\n{prefix}broken status — check\n\nWhen ON, Broken replies when you:\n• @mention the bot\n• reply to one of its messages\n• (in DM) send any message\n\nIt sends stickers too. Built by Broken_vzn.'
        }
    },

    async onStart({ args, reply, from, sock, message, React }) {
        React('👻');
        const sub = args[0]?.toLowerCase();
        const cfg = loadConfig();

        if (sub === 'on' || sub === 'enable' || sub === '1') {
            cfg[from] = { enabled: true, ts: Date.now() };
            saveConfig(cfg);
            return reply([
                `━━━━━━━━━━━━━━━━━━━━`,
                `  👻 *BROKEN: ON*`,
                `━━━━━━━━━━━━━━━━━━━━`,
                ``,
                `  I'm live. Mention me, reply to me,`,
                `  or just talk — I'll answer with attitude.`,
                ``,
                `  └ Turn off: .broken off`,
                `━━━━━━━━━━━━━━━━━━━━`,
            ].join('\n'));
        }

        if (sub === 'off' || sub === 'disable' || sub === '0') {
            delete cfg[from];
            saveConfig(cfg);
            chatHistories.delete(from);
            return reply(`👻 Broken is off. I'll go quiet.`);
        }

        const on = isEnabled(from);
        return reply([
            `━━━━━━━━━━━━━━━━━━━━`,
            `  👻 *BROKEN STATUS*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            ``,
            `  State: ${on ? '🟢 *ON*' : '🔴 *OFF*'}`,
            ``,
            `  ▸ .broken on — turn me on`,
            `  ▸ .broken off — turn me off`,
            `━━━━━━━━━━━━━━━━━━━━`,
        ].join('\n'));
    },

    // Fired on every non-command message when this command is loaded
    async onChat({ sock, from, message, chatText, sender, pushName }) {
        if (!isEnabled(from)) return;
        if (!chatText?.trim()) return;
        if (message?.key?.fromMe) return;

        const isDM = !String(from).endsWith('@g.us');

        // Only respond when relevant: mention, reply-to-bot, or DM
        const relevant = isDM || isForThisBot(sock, message);
        if (!relevant) return;

        const text = chatText.trim();
        const historyKey = `${from}:${sender}`;
        addHistory(historyKey, 'user', text);

        try { await sock.sendPresenceUpdate('composing', from); } catch {}

        // Small chance to send a vibe reaction
        if (Math.random() < 0.2) {
            try { await sock.sendMessage(from, { react: { key: message.key, text: vibeReaction() } }); } catch {}
        }

        const history = getHistory(historyKey);
        const system = PERSONA + `\n\nYou are talking to ${pushName || sender?.split('@')[0] || 'the user'} in ${isDM ? 'a private chat' : 'a WhatsApp group'}. Keep replies short (1-4 lines).`;

        try {
            const response = await aiChat(text, history.slice(0, -1), system);
            addHistory(historyKey, 'assistant', response);
            const quotedMsg = isDM ? message : undefined;
            await sock.sendMessage(from, { text: response }, { quoted: quotedMsg });
            await maybeSendSticker(sock, from, message.key);
        } catch (err) {
            addHistory(historyKey, 'assistant', 'I broke. One sec.');
            await sock.sendMessage(from, { text: '👻 *broken.exe stopped responding* — try again in a sec.' }, { quoted: message });
        }
    },
};
