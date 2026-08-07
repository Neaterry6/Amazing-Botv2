import axios from 'axios';

export default {
    config: {
        name: 'tiktokdl',
        aliases: ['tiktok', 'tt', 'ttdl'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Download TikTok videos without watermark',
        category: 'downloader',
        coolDown: 10,
        role: 0,
        guide: { en: '{prefix}tiktokdl <url>' },
    },
    async onStart({ args, reply, sock, from, message }) {
        if (!args.length) return reply('Paste a TikTok link.\nUsage: tiktokdl <url>');

        const url = args[0];
        if (!url.includes('tiktok.com')) return reply('That doesn\'t look like a TikTok URL.');

        try {
            // Use tikwm API
            const { data } = await axios.post('https://www.tikwm.com/api/', new URLSearchParams({ url }), { timeout: 30000 });
            if (!data.data) return reply('Failed to fetch video. Check the URL.');

            const videoUrl = data.data.play || data.data_hd;
            const { data: videoBuffer } = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 });

            await sock.sendMessage(from, {
                video: Buffer.from(videoBuffer),
                caption: `🎵 ${data.data.title || 'TikTok video'}\n👤 @${data.data.author?.unique_id || 'unknown'}`,
            }, { quoted: message });
        } catch (err) {
            reply('Download failed. The link might be private or invalid.');
        }
    },
};
