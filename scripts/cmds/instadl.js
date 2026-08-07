import axios from 'axios';

export default {
    config: {
        name: 'instadl',
        aliases: ['instagram', 'igdl', 'igdownload'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Download Instagram posts/reels',
        category: 'downloader',
        coolDown: 10,
        role: 0,
        guide: { en: '{prefix}instadl <url>' },
    },
    async onStart({ args, reply, sock, from, message }) {
        if (!args.length) return reply('Paste an Instagram link.\nUsage: instadl <url>');

        const url = args[0];
        if (!url.includes('instagram.com')) return reply('That doesn\'t look like an Instagram URL.');

        try {
            const { data } = await axios.post('https://api.cobalt.tools/', {
                url,
                videoQuality: '720',
                filenameStyle: 'basic',
            }, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                timeout: 30000,
            });

            if (!data.url) return reply('Failed to fetch. The post might be private.');

            // Check if it's a video or image
            const isVideo = data.url.includes('.mp4') || data.contentType?.includes('video');
            const { data: buffer } = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 60000 });

            if (isVideo) {
                await sock.sendMessage(from, { video: Buffer.from(buffer), caption: '📸 Instagram Reel' }, { quoted: message });
            } else {
                await sock.sendMessage(from, { image: Buffer.from(buffer), caption: '📸 Instagram post' }, { quoted: message });
            }
        } catch (err) {
            reply('Download failed. The post might be private or unavailable.');
        }
    },
};
