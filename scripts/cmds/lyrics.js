import axios from 'axios';

export default {
    config: {
        name: 'lyrics',
        aliases: ['lyric', 'songlyrics', 'getlyrics'],
        author: 'Broken_vzn',
        version: '2.0',
        shortDescription: 'Get song lyrics',
        category: 'music',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}lyrics <song name>\n{prefix}lyrics <artist> - <song>' },
    },

    async onStart({ args, reply, prefix, React }) {
        React('🎵');
        if (!args.length) return reply(`Usage: ${prefix}lyrics <song name>\nExample: ${prefix}lyrics shape of you`);

        const query = args.join(' ');

        // Parse "artist - song" format if given
        let artist = '';
        let title = query;
        if (query.includes(' - ')) {
            const parts = query.split(' - ');
            artist = parts[0].trim();
            title = parts.slice(1).join(' ').trim();
        }

        // If no artist given, search Deezer to resolve it
        if (!artist) {
            const resolved = await resolveTrack(query);
            if (resolved) {
                artist = resolved.artist;
                title = resolved.title;
            }
        }

        const lyrics = await fetchLyrics(artist, title, query);

        if (!lyrics) return reply(`❌ Could not find lyrics for *"${query}"*.`);

        const header = artist ? `🎵 *${title}* — ${artist}` : `🎵 *${title}*`;
        const body = lyrics.length > 3500 ? lyrics.substring(0, 3500) + '\n\n...' : lyrics;

        reply(`${header}\n━━━━━━━━━━━━━━━━━━━━\n\n${body}`);
    },
};

async function resolveTrack(query) {
    try {
        const { data } = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`, { timeout: 10000 });
        const t = data?.data?.[0];
        if (t?.title && t?.artist?.name) return { title: t.title, artist: t.artist.name };
    } catch {}
    return null;
}

async function fetchLyrics(artist, title, fallbackQuery) {
    // 1. lyrics.ovh (free, no key) — needs both artist & title
    if (artist) {
        try {
            const { data } = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, { timeout: 15000 });
            if (data?.lyrics && !data.lyrics.startsWith('{')) return data.lyrics;
        } catch {}
    }

    // 2. lrclib search (no key) — fuzzy by query
    try {
        const { data } = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(fallbackQuery)}`, { timeout: 15000 });
        if (Array.isArray(data) && data.length) {
            const hit = data[0];
            const lyric = hit?.syncedLyrics || hit?.plainLyrics;
            if (lyric) {
                // Convert synced [mm:ss.xx] lines to plain text
                return lyric.replace(/\[\d+:\d+\.\d+\]/g, '').trim();
            }
        }
    } catch {}

    return null;
}
