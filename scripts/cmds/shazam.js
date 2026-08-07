import axios from 'axios';
import FormData from 'form-data';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { searchDeezerList } from '../../src/utils/musicScraper.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function pickMedia(message) {
    const m = message?.message || {};
    const inner = m.ephemeralMessage?.message || m.viewOnceMessage?.message || m;
    const type = Object.keys(inner).find(k => ['audioMessage', 'videoMessage'].includes(k));
    if (!type) return null;
    return { type, msg: inner[type] };
}

export default {
    config: {
        name: 'shazam',
        aliases: ['identify', 'findmusic', 'recognize'],
        author: 'Broken_vzn',
        version: '2.0',
        shortDescription: 'Identify a song (audio) or search by text',
        category: 'music',
        coolDown: 5,
        role: 0,
        guide: {
            en: '{prefix}shazam <song name> — search tracks\n{prefix}shazam — reply to an audio/video to identify it\n\nFor audio identification, set AUDD_API_KEY in .env (free at audd.io). Without a key, it falls back to text search.'
        },
    },

    async onStart({ args, reply, message, sock, from, React }) {
        React('🎵');

        const media = pickMedia(message);
        const query = args.join(' ').trim();

        if (media && !query) return identifyAudio(message, media, reply, sock, from);

        if (!query) {
            return reply(`🎵 *Shazam*\n\n• Reply to an *audio/video* to identify the song\n• Or: ${'{prefix}'}shazam <song name> to search\n\nFor audio recognition, set *AUDD_API_KEY* in .env (free at audd.io).`);
        }

        React('🔍');
        try {
            const tracks = await searchDeezerList(query, 5);
            if (!tracks.length) return reply(`❌ No matches for "${query}".`);

            let out = `🎵 *Shazam Results* — "${query}"\n━━━━━━━━━━━━━━━━━━━━\n\n`;
            tracks.slice(0, 5).forEach((t, i) => {
                out += `${i + 1}. *${t.title}* — ${t.artist?.name}\n`;
                out += `   💽 ${t.album?.title || 'Unknown album'}\n`;
                if (t.preview) out += `   🎧 Preview: ${t.preview}\n`;
                out += `\n`;
            });
            out += `━━━━━━━━━━━━━━━━━━━━\n_Reply to an audio/video to auto-identify_`;
            return reply(out);
        } catch (err) {
            return reply(`❌ Search failed: ${err.message}`);
        }
    },
};

async function identifyAudio(message, media, reply, sock, from) {
    let buffer;
    try {
        buffer = await downloadMediaMessage(message, 'buffer', {});
    } catch (err) {
        return reply(`❌ Could not download audio: ${err.message}`);
    }
    if (!buffer) return reply(`❌ Empty audio.`);

    if (process.env.AUDD_API_KEY) return auddIdentify(buffer, reply);

    const hint = media.msg?.fileName || media.msg?.caption || '';
    const replyText = hint
        ? `🔍 *No AUDD_API_KEY set*, so I can't fingerprint audio yet.\n\nI saw a file named: *${hint}*\n\nTry: ${'{prefix}'}shazam ${hint.split('.')[0]}\nor set AUDD_API_KEY in .env for real recognition.`
        : `🔍 *No AUDD_API_KEY set*, so I can't fingerprint audio yet.\n\nSet *AUDD_API_KEY* in .env (free at audd.io) to enable real song recognition.\n\nFor now, tell me a song name: ${'{prefix}'}shazam <song>`;

    return reply(replyText);
}

async function auddIdentify(buffer, reply) {
    try {
        const form = new FormData();
        form.append('api_token', process.env.AUDD_API_KEY);
        form.append('file', buffer, { filename: 'audio.mp3', contentType: 'audio/mpeg' });
        form.append('return', 'apple_music,spotify,deezer');

        const { data } = await axios.post('https://api.audd.io/', form, {
            headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
            timeout: 30000,
        });

        if (!data?.result?.title) return reply(`❌ Could not identify the song. Try a clearer audio clip.`);

        const r = data.result;
        return reply([
            `━━━━━━━━━━━━━━━━━━━━`,
            `  🎵 *SONG IDENTIFIED*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            ``,
            `  🎧 *${r.title}*`,
            `  👤 ${r.artist || 'Unknown artist'}`,
            `  💽 ${r.album || ''}`,
            `  📅 ${r.release_date || ''}`,
            `  ⏱️ ${r.song_length || ''}`,
            ``,
            `  🔗 ${r.song_link || ''}`,
            ``,
            `━━━━━━━━━━━━━━━━━━━━`,
        ].join('\n'));
    } catch (err) {
        return reply(`❌ Identification failed: ${err.message}`);
    }
}
