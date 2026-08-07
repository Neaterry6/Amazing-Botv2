import axios from 'axios';

export default {
    config: {
        name: 'gdrvdl',
        aliases: ['gdrive', 'googledrive'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Download files from Google Drive',
        category: 'downloader',
        coolDown: 15,
        role: 0,
        guide: { en: '{prefix}gdrvdl <url>' },
    },
    async onStart({ args, reply, sock, from, message }) {
        if (!args.length) return reply('Paste a Google Drive link.\nUsage: gdrvdl <url>');

        const url = args[0];
        if (!url.includes('drive.google.com')) return reply('That doesn\'t look like a Google Drive URL.');

        try {
            // Extract file ID
            let fileId;
            const directMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            fileId = directMatch?.[1] || idMatch?.[1];

            if (!fileId) return reply('Could not extract file ID from URL.');

            // Use a public GD bypass
            const bypassUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
            const { headers, data: page } = await axios.get(bypassUrl, {
                maxRedirects: 0,
                validateStatus: s => s < 400,
                timeout: 15000,
            });

            // Check for virus scan warning (large files)
            let downloadUrl = bypassUrl;
            if (page?.includes('confirm=')) {
                const token = page.match(/confirm=([^&"]+)/)?.[1];
                if (token) downloadUrl = `${bypassUrl}&confirm=${token}`;
            }

            // Try to get filename from page
            const nameMatch = page?.match(/<title>([^<]+)<\/title>/);
            const fileName = nameMatch?.[1]?.replace(' - Google Drive', '')?.trim() || fileId;

            const { data: buffer, headers: dlHeaders } = await axios.get(downloadUrl, {
                responseType: 'arraybuffer',
                timeout: 120000,
            });

            if (buffer.length > 100 * 1024 * 1024) {
                return reply(`File too large (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Max 100MB.`);
            }

            const mime = dlHeaders['content-type'] || 'application/octet-stream';
            await sock.sendMessage(from, {
                document: buffer,
                fileName: fileName,
                mimetype: mime,
            }, { quoted: message });

            reply(`📥 *${fileName}*\nSize: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
        } catch (err) {
            reply('Download failed. The file might be too large, restricted, or the link is invalid.');
        }
    },
};
