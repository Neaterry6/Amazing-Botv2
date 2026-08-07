export default {
    config: {
        name: 'remind2',
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Usage: .remind2 <duration> <message>nExample: .remind2 10m Take a breaknDurati',
        category: 'utility',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}remind2 <args>' },
    },
    async onStart({ args, reply, prefix, sender, from, message, React }) {
        React('⚡');
        
            if (args.length < 2) return reply('Usage: .remind2 <duration> <message>\nExample: .remind2 10m Take a break\nDurations: s, m, h, d\n(Note: reminders are lost if the bot restarts.)');
            const durationMs = parseDuration(args[0]);
            if (!durationMs) return reply('Invalid duration format. Use something like 10m, 2h, or 1d.');
            const message = args.slice(1).join(' ');
            if (durationMs > 7 * 86400000) return reply('Reminders are capped at 7 days.');
            reply(`⏰ Got it — I'll remind you in ${args[0]}: "${message}"`);
            setTimeout(() => {
                King.sendMessage(from, { text: `🔔 *Reminder:* ${message}` }, { quoted: m }).catch(() => {});
            }, durationMs);
        
    },
};
