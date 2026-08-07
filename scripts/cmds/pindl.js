import axios from 'axios';

export default {
    config: {
        name: 'pindl',
        aliases: ['pinterest', 'pindownload'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Download Pinterest images/videos',
        category: 'downloader',
        coolDown: 10,
        role: 0,
        guide: { en: '{prefix}pindl <url>' },
    },
    async onStart({ args, reply, sock, from, message }) {
        if (!args.length) return reply('Paste a Pinterest link.\nUsage: pindl <url>');

        const url = args[0];
        if (!url.includes('pinterest.com') && !url.includes('pin.it')) return reply('That doesn\'t look like a Pinterest URL.');

        try {
            const { data } = await axios.post('https://api.cobalt.tools/', {
                url,
                filenameStyle: 'basic',
            }, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                timeout: 30000,
            });

            if (!data.url) return reply('Failed to fetch.');

            const { data: buffer } = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 60000 });
            const isVideo = (data.contentType || '').includes('video') || data.url.includes('.mp4');

            if (isVideo) {
                await sock.sendMessage(from, { video: Buffer.from(buffer), caption: '📌 Pinterest video' }, { quoted: message });
            } else {
                await sock.sendMessage(from, { image: Buffer.from(buffer), caption: '📌 Pinterest image' }, { quoted: message });
            }
        } catch (err) {
            reply('Download failed.');
        }
    },
};
