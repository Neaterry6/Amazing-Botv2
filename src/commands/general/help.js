import config from '../../config.js';
import axios from 'axios';
import moment from 'moment';

const BOOT = Date.now();

const CAT_EMOJI = {
    admin: '🛡️', ai: '🤖', downloader: '📥', economy: '💰',
    fun: '🎭', games: '🎮', general: '📱', media: '🎨',
    owner: '👑', utility: '🧰', info: '📊', misc: '⭐',
    scraper: '🔎', edit: '✨', music: '🎵', health: '💚',
};

const CAT_DESC = {
    admin: 'Group management & protection',
    ai: 'AI-powered features',
    downloader: 'Download from platforms',
    economy: 'Virtual currency system',
    fun: 'Entertainment & memes',
    games: 'Interactive games',
    general: 'Core bot commands',
    media: 'Media processing',
    owner: 'Bot owner controls',
    utility: 'Productivity tools',
    scraper: 'Web scraping tools',
    edit: 'Image editing',
    music: 'Music & lyrics',
    health: 'Health & habits',
};

// Quick-access commands shown on the main menu
const QUICK_ACCESS = ['ai', 'play', 'movie', 'sticker', 'download', 'imagine', 'lyrics'];

function uptime(ms) {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60), sc = s % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${sc}s`;
    if (m > 0) return `${m}m ${sc}s`;
    return `${sc}s`;
}

function ramUsage() {
    const mem = process.memoryUsage();
    return (mem.heapUsed / 1024 / 1024).toFixed(1) + ' MB';
}

async function fetchBotImage() {
    const apis = [
        { url: 'https://api.waifu.pics/sfw/waifu', parse: d => d?.url },
        { url: 'https://api.waifu.pics/sfw/neko', parse: d => d?.url },
        { url: 'https://nekos.best/api/v2/neko', parse: d => d?.results?.[0]?.url },
    ];
    for (const api of apis.sort(() => Math.random() - 0.5)) {
        try {
            const { data: meta } = await axios.get(api.url, { timeout: 6000 });
            const imgUrl = api.parse(meta);
            if (!imgUrl) continue;
            const res = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 10000 });
            const buf = Buffer.from(res.data);
            if (buf.length > 2000) return buf;
        } catch {}
    }
    return null;
}

export default {
    config: {
        name: 'help',
        aliases: ['menu', 'cmd', 'commands', 'menuhelp'],
        author: 'Broken_vzn',
        version: '3.0',
        shortDescription: 'Show beautiful help menu',
        category: 'general',
        coolDown: 5,
        role: 0,
        guide: { en: '{prefix}help [category]' }
    },

    async onStart({ args, reply, sender, prefix, pushName, message, sock, from, getAllCommands, getCommandsByCategory, getAllCategories, React }) {
        React('📋');
        const startHr = process.hrtime?.() || null;
        const measurePing = () => {
            if (!startHr) return '⚡';
            const diff = process.hrtime(startHr);
            return (diff[0] * 1000 + diff[1] / 1e6).toFixed(0) + ' ms';
        };

        const allCmds = getAllCommands();
        const cats = getAllCategories().sort();
        const cat = args[0]?.toLowerCase();

        // ---- CATEGORY VIEW ----
        if (cat && cats.includes(cat)) {
            const cmds = getCommandsByCategory(cat);
            const emoji = CAT_EMOJI[cat] || '⭐';
            const desc = CAT_DESC[cat] || '';

            let text = `╭──────────────────────────────╮\n`;
            text += `│  ${emoji} *${cat.toUpperCase()}* COMMANDS\n`;
            text += `│  ${desc}\n`;
            text += `╰──────────────────────────────╯\n\n`;

            for (const cmd of (cmds || []).sort((a, b) => a.name.localeCompare(b.name))) {
                text += `  ◆ ${prefix}${cmd.name}`;
                if (cmd.aliases?.length) text += ` _(${cmd.aliases[0]})_`;
                text += `\n`;
                if (cmd.description) text += `    ${cmd.description}\n`;
            }

            text += `\n╭──────────────────────────────╮\n`;
            text += `│  📊 ${cmds?.length || 0} commands\n`;
            text += `│  ${prefix}help — back to menu\n`;
            text += `╰──────────────────────────────╯`;

            return reply(text);
        }

        // ---- MAIN MENU ----
        const name = pushName || 'User';
        const uid = sender.split('@')[0].split(':')[0];
        const now = moment();
        const botName = '𝐀𝐌𝐀𝐙𝐈𝐍𝐆 𝐁𝐎𝐓';

        let text = `⟡ ────── 『 ${botName} 』 ────── ⟡\n`;
        text += `ᴛʜᴇ ᴜʟᴛɪᴍᴀᴛᴇ ᴡʜᴀᴛsᴀᴘᴘ ᴀssɪsᴛᴀɴᴛ\n\n`;
        text += `╭─────────────── ✦ ───────────────╮\n`;
        text += `│  👋 Welcome, @${uid}\n`;
        text += `│  ◈ Prefix : ${prefix}\n`;
        text += `│  ◈ Version : v1.0.0\n`;
        text += `│  ◈ Status : Online ●\n`;
        text += `│  ◈ Uptime : ${uptime(Date.now() - BOOT)}\n`;
        text += `│  ◈ Speed : ${measurePing()}\n`;
        text += `╰─────────────── ✦ ───────────────╯\n\n`;
        text += `⟡ 𝐌 𝐀 𝐈 𝐍 𝐌 𝐄 𝐍 𝐔 ⟡\n`;
        text += `╭────────────────────────────────╮\n`;

        for (const c of cats) {
            const cmds = getCommandsByCategory(c);
            if (!cmds?.length) continue;
            const emoji = CAT_EMOJI[c.toLowerCase()] || '⭐';
            text += `│  ❖ ${emoji} ${c.toUpperCase()}\n`;
        }
        text += `╰────────────────────────────────╯\n\n`;
        text += `╭───────────── 𝐐𝐔𝐈𝐂𝐊 𝐀𝐂𝐂𝐄𝐒𝐒 ─────────────╮\n`;
        text += `│\n`;

        const quickNames = QUICK_ACCESS.filter(q => allCmds.some(c => c.name === q || (c.aliases || []).includes(q)));
        for (const q of quickNames) {
            text += `│  › ${prefix}${q}\n`;
        }
        text += `╰────────────────────────────────────────────╯\n\n`;
        text += `⟡ Type \`${prefix}help <category>\` for more info ⟡\n`;
        text += `⟡ Example: \`${prefix}help ai\` ⟡\n\n`;
        text += `╭────────────────────────────────╮\n`;
        text += `│  ✦ 𝐀𝐌𝐀𝐙𝐈𝐍𝐆 𝐁𝐎𝐓 ✦\n`;
        text += `│  ᴍᴀᴅᴇ ᴛᴏ ʙᴇ ᴅɪғғᴇʀᴇɴᴛ\n`;
        text += `╰────────────────────────────────╯`;

        // Send with image + mention
        const img = await fetchBotImage().catch(() => null);
        if (img) {
            try {
                return await sock.sendMessage(from, {
                    image: img,
                    caption: text,
                    mentions: [sender],
                }, { quoted: message });
            } catch {}
        }

        reply({ text, mentions: [sender] });
    }
};
