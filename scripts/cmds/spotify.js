import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cacheFolder = path.resolve(__dirname, 'cache');
if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder, { recursive: true });

function deepFindUrl(obj, depth = 0) {
    if (depth > 7 || !obj) return null;
    if (typeof obj === 'string' && obj.startsWith('http') && (
        obj.includes('.mp3') || obj.includes('.mp4') || obj.includes('.m4a') ||
        obj.includes('googlevideo') || obj.includes('youtube') || obj.includes('ytdl') ||
        obj.includes('cdn') || obj.includes('download') || obj.includes('audio') || obj.includes('media') ||
        obj.includes('.webm')
    )) return obj;
    if (typeof obj === 'object' && obj !== null) {
        const priority = ['url', 'link', 'audio', 'audioUrl', 'download', 'downloadUrl', 'file', 'src', 'stream', 'media', 'mp3', 'result', 'data', 'output', 'response'];
        for (const k of priority) { if (obj[k]) { const f = deepFindUrl(obj[k], depth + 1); if (f) return f; } }
        for (const k of Object.keys(obj)) { if (!priority.includes(k)) { const f = deepFindUrl(obj[k], depth + 1); if (f) return f; } }
    }
    return null;
}
function deepFindTitle(obj, depth = 0) {
    if (depth > 7 || !obj) return null;
    if (typeof obj === 'object' && obj !== null) {
        const keys = ['title', 'name', 'videoTitle', 'song', 'track', 'fileName'];
        for (const k of keys) if (obj[k] && typeof obj[k] === 'string') return obj[k];
        for (const k of Object.keys(obj)) { const f = deepFindTitle(obj[k], depth + 1); if (f) return f; }
    }
    return null;
}
function deepFindThumbnail(obj, depth = 0) {
    if (depth > 7 || !obj) return null;
    if (typeof obj === 'string' && obj.startsWith('http') && (obj.includes('thumb') || obj.includes('image') || obj.includes('cover') || obj.includes('artwork') || obj.includes('.jpg') || obj.includes('.png') || obj.includes('.webp'))) return obj;
    if (typeof obj === 'object' && obj !== null) {
        const priority = ['thumbnail', 'thumb', 'image', 'cover', 'artwork', 'albumArt', 'album_art', 'img', 'poster'];
        for (const k of priority) { if (obj[k]) { const f = deepFindThumbnail(obj[k], depth + 1); if (f) return f; } }
        for (const k of Object.keys(obj)) { if (!priority.includes(k)) { const f = deepFindThumbnail(obj[k], depth + 1); if (f) return f; } }
    }
    return null;
}

async function searchDeezer(query) {
    try {
        const { data } = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`, { timeout: 10000 });
        const t = data?.data?.[0];
        if (t) return { title: t.title, artist: t.artist?.name, cover: t.album?.cover_medium, preview: t.preview, link: t.link };
    } catch {}
    return null;
}

async function getDownloadUrl(query) {
    const headers = { 'User-Agent': 'Mozilla/5.0 (AmazingBot)' };
    const endpoints = [
        { name: 'DrexApp', url: `https://api.drexapp.space/downloader/ytplayv2?q=${encodeURIComponent(query)}` },
        { name: 'DavidCyril', url: `https://apis.davidcyril.name.ng/play?query=${encodeURIComponent(query)}&format=audio` },
    ];
    for (const ep of endpoints) {
        try {
            const { data } = await axios.get(ep.url, { headers, timeout: 30000 });
            const url = deepFindUrl(data);
            if (url) return { url, title: deepFindTitle(data), thumbnail: deepFindThumbnail(data), source: ep.name };
        } catch {}
    }
    return null;
}

export default {
    config: {
        name: 'spotify',
        aliases: ['spotifydl', 'spdl', 'sdl'],
        author: 'Broken_vzn',
        version: '2.0',
        shortDescription: 'Download & send music from Spotify/YouTube',
        category: 'music',
        coolDown: 10,
        role: 0,
        guide: { en: '{prefix}spotify <song name or url>' },
    },

    async onStart({ args, reply, prefix, sock, from, message, React }) {
        React('🎵');
        if (!args.length) return reply(`Usage: ${prefix}spotify <song name or url>\nExample: ${prefix}spotify shape of you`);

        const query = args.join(' ').trim();
        await reply(`🎵 *Searching:* ${query}\n⏳ Grabbing audio...`);

        // Get metadata from Deezer for a nice card
        const meta = await searchDeezer(query);

        // Get actual download
        const dl = await getDownloadUrl(query);
        if (!dl?.url) return reply(`❌ Could not find audio for *"${query}"*. Try a different search.`);

        const title = dl.title || meta?.title || query;
        const artist = meta?.artist || '';

        // Send preview card with album art if available
        if (meta?.cover) {
            try {
                const imgRes = await axios.get(meta.cover, { responseType: 'arraybuffer', timeout: 10000 });
                await sock.sendMessage(from, { image: Buffer.from(imgRes.data), caption: `🎵 *${title}*${artist ? ` — ${artist}` : ''}\n\n⏳ Downloading audio...` }, { quoted: message });
            } catch {}
        } else {
            await sock.sendMessage(from, { text: `🎵 *${title}*${artist ? ` — ${artist}` : ''}\n\n⏳ Downloading audio...` }, { quoted: message });
        }

        // Download & send audio
        const safeName = title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').slice(0, 40);
        const tmpPath = path.join(cacheFolder, `${safeName}_${Date.now()}.mp3`);

        try {
            const stream = await axios({ url: dl.url, method: 'GET', responseType: 'stream', timeout: 90000, headers: { 'User-Agent': 'Mozilla/5.0' } });
            const writer = fs.createWriteStream(tmpPath);
            stream.data.pipe(writer);
            await new Promise((res, rej) => { writer.on('finish', res); writer.on('error', rej); });

            await sock.sendMessage(from, {
                audio: { url: tmpPath },
                mimetype: 'audio/mpeg',
                fileName: `${safeName}.mp3`,
                ptt: false,
            }, { quoted: message });
        } catch (err) {
            await reply(`❌ Failed to download audio: ${err.message}`);
        } finally {
            if (fs.existsSync(tmpPath)) fs.unlink(tmpPath, () => {});
        }
    },
};
