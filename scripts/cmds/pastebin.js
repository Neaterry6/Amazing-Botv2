import { isDev } from '../../src/utils/devAccess.js';

export default {
    config: {
        name: 'pastebin',
        aliases: ['paste', 'pb'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Upload text to pastebin (dev only)',
        category: 'owner',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}pastebin <text> or reply to message' },
    },

    async onStart({ args, reply, sender, message, React }) {
        React('📋');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);

        let text = args.join(' ').trim();
        // Try quoted message text
        if (!text) {
            const quoted = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            text = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
        }
        if (!text) return reply(`Usage: {prefix}pastebin <text> or reply to a message`);

        try {
            const res = await fetch('https://pastebin.com/api/api_post.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    api_dev_key: process.env.PASTEBIN_KEY || '',
                    api_option: 'paste',
                    api_paste_code: text,
                    api_paste_private: '1',
                }),
            });
            const url = await res.text();
            if (url.startsWith('http')) reply(`📋 *Paste created:*\n\n${url}`);
            else reply(`❌ Paste failed: ${url}`);
        } catch (err) {
            reply(`❌ Error: ${err.message}`);
        }
    },
};
