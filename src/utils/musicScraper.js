// Shared music scraper utility
// Provides multi-source fallback for: lyrics, spotify download, shazam identify
import axios from 'axios';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// ---------- LYRICS SOURCES (in priority order) ----------

export async function scrapeLyrics(query) {
    // Parse artist - song
    let artist = '', title = query;
    if (query.includes(' - ')) {
        const p = query.split(' - ');
        artist = p[0].trim(); title = p.slice(1).join(' ').trim();
    }

    // If no artist, resolve via Deezer
    if (!artist) {
        const resolved = await searchDeezer(query);
        if (resolved) { artist = resolved.artist; title = resolved.title; }
    }

    const sources = [
        () => lrclib(query, artist, title),
        () => lyricsOvh(artist, title),
        () => deezerLyrics(query),
    ];
    for (const fn of sources) {
        try {
            const r = await fn();
            if (r) return r;
        } catch {}
    }
    return null;
}

async function lrclib(query, artist, title) {
    let url = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
    if (artist) url += `&artist_name=${encodeURIComponent(artist)}`;
    if (title && title !== query) url += `&track_name=${encodeURIComponent(title)}`;
    const { data } = await axios.get(url, { headers: { 'User-Agent': UA }, timeout: 15000 });
    if (Array.isArray(data) && data.length) {
        const hit = data[0];
        const lyric = hit?.plainLyrics || hit?.syncedLyrics || '';
        if (lyric) return { title: hit.trackName || title, artist: hit.artistName || artist, lyrics: lyric.replace(/\[\d+:\d+\.\d+\]/g, '').trim(), source: 'LRCLib' };
    }
    return null;
}

async function lyricsOvh(artist, title) {
    if (!artist) return null;
    try {
        const { data } = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, { timeout: 15000 });
        if (data?.lyrics && !data.lyrics.startsWith('{')) return { title, artist, lyrics: data.lyrics, source: 'Lyrics.ovh' };
    } catch {}
    return null;
}

async function deezerLyrics(query) {
    // Deezer sometimes has lyrics via track detail
    const { data } = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`, { timeout: 10000 });
    const track = data?.data?.[0];
    if (!track?.id) return null;
    try {
        const r = await axios.get(`https://api.deezer.com/track/${track.id}/lyrics`, { timeout: 10000 });
        if (r?.data?.lyrics) return { title: track.title, artist: track.artist?.name, lyrics: r.data.lyrics.text || r.data.lyrics, source: 'Deezer' };
    } catch {}
    return null;
}

// ---------- SONG SEARCH / METADATA ----------

export async function searchDeezer(query, limit = 1) {
    const { data } = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`, { timeout: 10000 });
    const t = data?.data?.[0];
    if (t) return { title: t.title, artist: t.artist?.name, cover: t.album?.cover_medium, preview: t.preview, id: t.id };
    return null;
}

export async function searchDeezerList(query, limit = 5) {
    const { data } = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`, { timeout: 10000 });
    return data?.data || [];
}

// ---------- SPOTIFY / AUDIO DOWNLOAD SOURCES (priority order) ----------

export function deepFindUrl(obj, depth = 0) {
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
export function deepFindTitle(obj, depth = 0) {
    if (depth > 7 || !obj) return null;
    if (typeof obj === 'object' && obj !== null) {
        const keys = ['title', 'name', 'videoTitle', 'song', 'track', 'fileName'];
        for (const k of keys) if (obj[k] && typeof obj[k] === 'string') return obj[k];
        for (const k of Object.keys(obj)) { const f = deepFindTitle(obj[k], depth + 1); if (f) return f; }
    }
    return null;
}
export function deepFindThumbnail(obj, depth = 0) {
    if (depth > 7 || !obj) return null;
    if (typeof obj === 'string' && obj.startsWith('http') && (obj.includes('thumb') || obj.includes('image') || obj.includes('cover') || obj.includes('artwork') || obj.includes('.jpg') || obj.includes('.png') || obj.includes('.webp'))) return obj;
    if (typeof obj === 'object' && obj !== null) {
        const priority = ['thumbnail', 'thumb', 'image', 'cover', 'artwork', 'albumArt', 'album_art', 'img', 'poster'];
        for (const k of priority) { if (obj[k]) { const f = deepFindThumbnail(obj[k], depth + 1); if (f) return f; } }
        for (const k of Object.keys(obj)) { if (!priority.includes(k)) { const f = deepFindThumbnail(obj[k], depth + 1); if (f) return f; } }
    }
    return null;
}

export async function scrapeSpotifyDownload(query) {
    const headers = { 'User-Agent': UA };
    const sources = [
        {
            name: 'DrexApp',
            url: `https://api.drexapp.space/downloader/ytplayv2?q=${encodeURIComponent(query)}`,
            parse: d => ({ url: d?.result?.downloadUrl || deepFindUrl(d), title: d?.result?.title || deepFindTitle(d), thumbnail: d?.result?.thumbnail || deepFindThumbnail(d) })
        },
        {
            name: 'DavidCyril',
            url: `https://apis.davidcyril.name.ng/play?query=${encodeURIComponent(query)}&format=audio`,
            parse: d => ({ url: deepFindUrl(d), title: d?.result?.title || deepFindTitle(d), thumbnail: deepFindThumbnail(d) })
        },
    ];
    for (const src of sources) {
        try {
            const { data } = await axios.get(src.url, { headers, timeout: 30000 });
            const parsed = src.parse(data);
            if (parsed?.url) return { url: parsed.url, title: parsed.title || query, thumbnail: parsed.thumbnail, source: src.name };
        } catch {}
    }
    return null;
}
