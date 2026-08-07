import { runAnimeAction } from '../../src/utils/animeAction.js';

export default {
    config: {
        name: 'handhold',
        aliases: [],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Anime handhold reaction',
        category: 'fun',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}handhold [@user]' },
    },
    async onStart({ reply, sock, message, from, React }) {
        React('✨');
        try {
            await runAnimeAction({ sock, message, from, action: 'handhold' });
        } catch (err) {
            reply('❌ Could not fetch anime media. Try again later.');
        }
    },
};
