import { isDev } from '../../src/utils/devAccess.js';

export default {
    config: {
        name: 'sessioninfo',
        aliases: ['session', 'sess', 'whoami'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Show bot session credentials (dev only)',
        category: 'owner',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}sessioninfo' },
    },

    async onStart({ reply, sock, sender, React }) {
        React('🪪');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);

        const u = sock?.user || {};
        const device = u.device || 'Unknown';
        const platform = (u.phone?.device_manufacturer || u.platform || 'Unknown');

        reply([
            `━━━━━━━━━━━━━━━━━━━━`,
            `  🪪 *BOT SESSION*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            ``,
            `  👤 Name: ${u.name || 'N/A'}`,
            `  🆔 ID: ${u.id || 'N/A'}`,
            `  📱 Device: ${device}`,
            `  💻 Platform: ${platform}`,
            `  📶 Connection: ${sock?.ws?.readyState === 1 ? 'Open' : 'Closed'}`,
            `  🤖 Broadcaster: ${u.broadcast ? 'Yes' : 'No'}`,
            ``,
            `━━━━━━━━━━━━━━━━━━━━`,
        ].join('\n'));
    },
};
