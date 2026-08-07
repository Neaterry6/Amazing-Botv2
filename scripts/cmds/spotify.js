import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { scrapeSpotifyDownload, searchDeezer } from '../../src/utils/musicScraper.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cacheFolder = path.resolve(__dirname, 'cache');
if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder, { recursive: true });

export default {
    config: {
        name: 'spotify',
        aliases: ['spotifydl', 'spdl', 'sdl'],
        author: 'Broken_vzn',
        version: '3.0',
        shortDescription: 'Download & send music (multi-source scraper)',
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

        const meta = await searchDeezer(query);
        const dl = await scrapeSpotifyDownload(query);
        if (!dl?.url) return reply(`❌ Could not find audio for *"${query}"*. Try a different search.`);

        const title = dl.title || meta?.title || query;
        const artist = meta?.artist || '';

        // Album art card
        if (meta?.cover) {
            try {
                const imgRes = await axios.get(meta.cover, { responseType: 'arraybuffer', timeout: 10000 });
                await sock.sendMessage(from, { image: Buffer.from(imgRes.data), caption: `🎵 *${title}*${artist ? ` — ${artist}` : ''}\n\n⏳ Downloading audio...` }, { quoted: message });
            } catch {}
        } else {
            await sock.sendMessage(from, { text: `🎵 *${title}*${artist ? ` — ${artist}` : ''}\n\n⏳ Downloading audio...` }, { quoted: message });
        }

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
