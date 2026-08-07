import { scrapeLyrics } from '../../src/utils/musicScraper.js';

export default {
    config: {
        name: 'lyrics',
        aliases: ['lyric', 'songlyrics', 'getlyrics'],
        author: 'Broken_vzn',
        version: '3.0',
        shortDescription: 'Get song lyrics (multi-source scraper)',
        category: 'music',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}lyrics <song name>\n{prefix}lyrics <artist> - <song>' },
    },

    async onStart({ args, reply, prefix, React }) {
        React('🎵');
        if (!args.length) return reply(`Usage: ${prefix}lyrics <song name>\nExample: ${prefix}lyrics shape of you`);

        const query = args.join(' ');
        const result = await scrapeLyrics(query);

        if (!result) return reply(`❌ Could not find lyrics for *"${query}"*.`);

        const header = result.artist ? `🎵 *${result.title}* — ${result.artist}` : `🎵 *${result.title}*`;
        const body = result.lyrics.length > 3500 ? result.lyrics.substring(0, 3500) + '\n\n...' : result.lyrics;

        reply(`${header}\n━━━━━━━━━━━━━━━━━━━━\n\n${body}\n\n_via ${result.source}_`);
    },
};
