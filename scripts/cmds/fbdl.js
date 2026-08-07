import axios from 'axios';

export default {
    config: {
        name: 'fbdl',
        aliases: ['facebook', 'fbvideo'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Download Facebook videos',
        category: 'downloader',
        coolDown: 10,
        role: 0,
        guide: { en: '{prefix}fbdl <url>' },
    },
    async onStart({ args, reply, sock, from, message }) {
        if (!args.length) return reply('Paste a Facebook video link.\nUsage: fbdl <url>');

        const url = args[0];
        if (!url.includes('facebook.com') && !url.includes('fb.watch') && !url.includes('fb.com')) {
            return reply('That doesn\'t look like a Facebook URL.');
        }

        try {
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
                caption: '📘 Facebook video download',
            }, { quoted: message });
        } catch (err) {
            reply('Download failed. The video might be private or restricted.');
        }
    },
};
