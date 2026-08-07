import { runAnimeAction } from '../../src/utils/animeAction.js';

export default {
    config: {
        name: 'slap',
        aliases: [],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Anime slap reaction',
        category: 'fun',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}slap [@user]' },
    },
    async onStart({ reply, sock, message, from, React }) {
        React('✨');
        try {
            await runAnimeAction({ sock, message, from, action: 'slap' });
        } catch (err) {
            reply('❌ Could not fetch anime media. Try again later.');
        }
    },
};
