import axios from 'axios';

export default {
    config: {
        name: 'twitterdl',
        aliases: ['twitter', 'xdl', 'xdownload'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Download Twitter/X videos',
        category: 'downloader',
        coolDown: 10,
        role: 0,
        guide: { en: '{prefix}twitterdl <url>' },
    },
    async onStart({ args, reply, sock, from, message }) {
        if (!args.length) return reply('Paste a Twitter/X link.\nUsage: twitterdl <url>');

        const url = args[0];
        if (!url.includes('twitter.com') && !url.includes('x.com')) return reply('That doesn\'t look like a Twitter URL.');

        try {
            const apiUrl = `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`;
            // Fallback: use cobalt.tools
            const { data } = await axios.post('https://api.cobalt.tools/', {
                url,
                videoQuality: '720',
                filenameStyle: 'basic',
            }, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                timeout: 30000,
            });

            if (!data.url) return reply('Failed to fetch video.');

            const { data: videoBuffer } = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 60000 });

            await sock.sendMessage(from, {
                video: Buffer.from(videoBuffer),
                caption: '🐦 Twitter/X download',
            }, { quoted: message });
        } catch (err) {
            reply('Download failed. The tweet might be private or contain no video.');
        }
    },
};
