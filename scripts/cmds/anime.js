import { runAnimeAction } from '../../src/utils/animeAction.js';

const ACTIONS = ['hug', 'slap', 'kiss', 'pat', 'poke', 'kick', 'punch', 'kill', 'bite',
    'cuddle', 'lick', 'bully', 'bonk', 'yeet', 'wave', 'handhold', 'highfive',
    'smile', 'blush', 'happy', 'wink', 'cry', 'dance', 'cringe'];

export default {
    config: {
        name: 'anime',
        aliases: ['animeaction', 'act'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Anime reaction/action (hug, slap, kiss...)',
        category: 'fun',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}anime <action> [@user]\n\nActions: ' + ACTIONS.join(', ') },
    },

    async onStart({ args, reply, sock, message, from, React }) {
        const action = (args[0] || '').toLowerCase();
        if (!ACTIONS.includes(action)) {
            return reply(`❌ Unknown action.\n\nAvailable: ${ACTIONS.map(a => `\`${a}\``).join(', ')}\n\nUsage: {prefix}anime <action> [@user]`);
        }
        React('✨');
        try {
            await runAnimeAction({ sock, message, from, action });
        } catch (err) {
            reply(`❌ Could not fetch anime media: ${err.message}`);
        }
    },
};
