import { runAnimeAction } from '../../src/utils/animeAction.js';

export default {
    config: {
        name: 'punch',
        aliases: [],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Anime punch reaction',
        category: 'fun',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}punch [@user]' },
    },
    async onStart({ reply, sock, message, from, React }) {
        React('✨');
        try {
            await runAnimeAction({ sock, message, from, action: 'punch' });
        } catch (err) {
            reply('❌ Could not fetch anime media. Try again later.');
        }
    },
};
