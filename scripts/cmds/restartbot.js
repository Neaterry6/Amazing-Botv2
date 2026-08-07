import { isDev } from '../../src/utils/devAccess.js';

export default {
    config: {
        name: 'restartbot',
        aliases: ['restart', 'reboot'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Restart the bot (dev only)',
        category: 'owner',
        coolDown: 30,
        role: 0,
        guide: { en: '{prefix}restartbot' },
    },

    async onStart({ reply, sender, React }) {
        React('🔄');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);

        reply('🔄 *Restarting bot...*\n\nPlease wait ~15 seconds, I\'ll be right back.');

        setTimeout(() => {
            try {
                process.exit(0);
            } catch {}
        }, 1500);
    },
};
