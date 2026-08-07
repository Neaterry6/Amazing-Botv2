import axios from 'axios';

export default {
    config: {
        name: 'ytmp3',
        aliases: ['yta', 'ytaudio'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Download YouTube as MP3',
        category: 'downloader',
        coolDown: 15,
        role: 0,
        guide: { en: '{prefix}ytmp3 <url>' },
    },

    async onStart({ args, reply, prefix, React }) {
        React('🎵');
        if (!args.length) return reply(`Usage: ${prefix}ytmp3 <YouTube URL>`);

        const url = args[0];
        if (!url.includes('youtu')) return reply(`❌ Provide a valid YouTube URL.`);

        try {
            await reply(`🎵 Downloading audio...`);

            // Try multiple APIs
            const apis = [
                `https://api.vevioz.com/api/button/mp3/${url.split('v=')[1]?.split('&')[0] || url.split('/').pop()}`,
            ];

            reply(`ℹ️ YouTube MP3 download requires a backend API.\nUse the *play* command for audio from YouTube.`);
        } catch (err) {
            reply(`❌ Error: ${err.message}`);
        }
    },
};
