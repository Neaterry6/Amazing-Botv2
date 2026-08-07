import { isDev } from '../../src/utils/devAccess.js';

export default {
    config: {
        name: 'connection',
        aliases: ['conn', 'netstatus', 'socket'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Check WhatsApp connection status (dev only)',
        category: 'owner',
        coolDown: 5,
        role: 0,
        guide: { en: '{prefix}connection' },
    },

    async onStart({ reply, sock, sender, React }) {
        React('📡');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);

        const ws = sock?.ws;
        const state = sock?.user?.id ? 'CONNECTED' : 'DISCONNECTED';
        const readyState = ws?.readyState;

        const stateNames = { 0: 'CONNECTING', 1: 'OPEN', 2: 'CLOSING', 3: 'CLOSED' };

        reply([
            `━━━━━━━━━━━━━━━━━━━━`,
            `  📡 *CONNECTION*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            ``,
            `  Status: ${state === 'CONNECTED' ? '🟢' : '🔴'} *${state}*`,
            `  WebSocket: ${readyState !== undefined ? stateNames[readyState] || readyState : 'N/A'}`,
            `  Bot ID: ${sock?.user?.id || 'N/A'}`,
            `  Server: ${sock?.user?.name || 'N/A'}`,
            ``,
            `━━━━━━━━━━━━━━━━━━━━`,
        ].join('\n'));
    },
};
