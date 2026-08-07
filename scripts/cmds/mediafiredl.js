import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
    config: {
        name: 'mediafiredl',
        aliases: ['mediafire', 'mfdl'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Download files from MediaFire',
        category: 'downloader',
        coolDown: 15,
        role: 0,
        guide: { en: '{prefix}mediafiredl <url>' },
    },
    async onStart({ args, reply, sock, from, message }) {
        if (!args.length) return reply('Paste a MediaFire link.\nUsage: mediafiredl <url>');

        const url = args[0];
        if (!url.includes('mediafire.com')) return reply('That doesn\'t look like a MediaFire URL.');

        try {
            // Fetch the page and extract download link
            const { data: html } = await axios.get(url, { timeout: 15000 });
            const match = html.match(/href="(https?:\/\/download\d+\.mediafire\.com\/[^"]+)"/i)
                || html.match(/href="(\/[^"]+)"[^>]*class="download_link"[^>]*>/i);

            let dlUrl = match?.[1];
            if (dlUrl && !dlUrl.startsWith('http')) dlUrl = 'https://www.mediafire.com' + dlUrl;

            if (!dlUrl) return reply('Could not find download link. The file might be too large or removed.');

            // Get file info
            const nameMatch = html.match(/<div class="filename">([^<]+)<\/div>/i);
            const fileName = nameMatch?.[1] || 'download';

            const { data: buffer } = await axios.get(dlUrl, { responseType: 'arraybuffer', timeout: 120000 });
            const fileSize = (buffer.length / (1024 * 1024)).toFixed(2);

            if (buffer.length > 100 * 1024 * 1024) {
                return reply(`File too large (${fileSize}MB). Max 100MB.`);
            }

            await sock.sendMessage(from, {
                document: buffer,
                fileName: fileName,
                mimetype: 'application/octet-stream',
            }, { quoted: message });

            reply(`📥 *${fileName}*\nSize: ${fileSize} MB`);
        } catch (err) {
            reply('Download failed. Check the link and try again.');
        }
    },
};
