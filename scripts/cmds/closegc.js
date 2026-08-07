import { setSchedule, getSchedule, clearSchedule } from '../../src/utils/gcScheduler.js';

export default {
    config: {
        name: 'closegc',
        aliases: ['gcclose', 'scheduleclose'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Auto-close the group at a set time daily',
        category: 'admin',
        coolDown: 3,
        role: 1,
        groupOnly: true,
        guide: { en: '{prefix}closegc <time>\n{prefix}closegc off — remove\n\nTime format: "14:30" or "9:00 PM"' },
    },

    async onStart({ args, reply, from, isGroupAdmin, React }) {
        React('🔒');
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);
        const time = args.join(' ').trim();

        if (!time || time.toLowerCase() === 'off' || time.toLowerCase() === 'remove') {
            const sched = getSchedule(from);
            if (!sched?.closeTime && !sched?.openTime) return reply(`No schedule set for this group.`);
            if (sched?.openTime) {
                setSchedule(from, { openTime: sched.openTime, lastOpen: sched.lastOpen });
                return reply(`🗑️ Auto-close removed. Group will still open at ${sched.openTime}.`);
            }
            clearSchedule(from);
            return reply(`🗑️ All group time schedules removed.`);
        }

        const valid = /^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(time);
        if (!valid) return reply(`❌ Invalid time. Use "14:30" or "9:00 PM".`);

        const existing = getSchedule(from) || {};
        setSchedule(from, { ...existing, closeTime: time });
        reply([
            `━━━━━━━━━━━━━━━━━━━━`,
            `  🔒 *AUTO-CLOSE SET*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            ``,
            `  🕐 Group closes at: *${time}*`,
            `  📅 Every day`,
            ``,
            `  └ Remove: {prefix}closegc off`,
            `━━━━━━━━━━━━━━━━━━━━`,
        ].join('\n'));
    },
};
