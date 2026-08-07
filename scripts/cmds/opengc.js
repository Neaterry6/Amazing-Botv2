import { setSchedule, getSchedule, clearSchedule } from '../../src/utils/gcScheduler.js';

export default {
    config: {
        name: 'opengc',
        aliases: ['gcopen', 'scheduleopen'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Auto-open the group at a set time daily',
        category: 'admin',
        coolDown: 3,
        role: 1,
        groupOnly: true,
        guide: { en: '{prefix}opengc <time>\n{prefix}opengc off — remove\n\nTime format: "14:30" or "9:00 PM"' },
    },

    async onStart({ args, reply, from, isGroupAdmin, React }) {
        React('🔓');
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);
        const time = args.join(' ').trim();

        if (!time || time.toLowerCase() === 'off' || time.toLowerCase() === 'remove') {
            const sched = getSchedule(from);
            if (!sched?.openTime && !sched?.closeTime) return reply(`No schedule set for this group.`);
            if (sched?.closeTime) {
                setSchedule(from, { closeTime: sched.closeTime, lastClose: sched.lastClose });
                return reply(`🗑️ Auto-open removed. Group will still close at ${sched.closeTime}.`);
            }
            clearSchedule(from);
            return reply(`🗑️ All group time schedules removed.`);
        }

        const valid = /^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(time);
        if (!valid) return reply(`❌ Invalid time. Use "14:30" or "9:00 PM".`);

        const existing = getSchedule(from) || {};
        setSchedule(from, { ...existing, openTime: time });
        reply([
            `━━━━━━━━━━━━━━━━━━━━`,
            `  🔓 *AUTO-OPEN SET*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            ``,
            `  🕐 Group opens at: *${time}*`,
            `  📅 Every day`,
            ``,
            `  └ Remove: {prefix}opengc off`,
            `━━━━━━━━━━━━━━━━━━━━`,
        ].join('\n'));
    },
};
