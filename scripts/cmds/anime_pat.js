import { runAnimeAction } from '../../src/utils/animeAction.js';

export default {
    config: {
        name: 'pat',
        aliases: [],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Anime pat reaction',
        category: 'fun',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}pat [@user]' },
    },
    async onStart({ reply, sock, message, from, React }) {
        React('✨');
        try {
            await runAnimeAction({ sock, message, from, action: 'pat' });
        } catch (err) {
            reply('❌ Could not fetch anime media. Try again later.');
        }
    },
};
