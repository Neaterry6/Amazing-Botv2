import { getActiveUsers } from '../../src/utils/activityStore.js';

export default {
    config: {
        name: 'tagactive',
        aliases: ['active', 'tagonline'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Tag members active in the last 24h',
        category: 'admin',
        coolDown: 5,
        role: 1,
        groupOnly: true,
        guide: { en: '{prefix}tagactive [message]\n{prefix}tagactive <hours> [message] — custom window' },
    },

    async onStart({ args, reply, sock, from, message, isGroup, isGroupAdmin, React }) {
        React('🟢');
        if (!isGroup) return reply('Group only.');
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);

        // Parse optional hours window
        let hours = 24;
        let text = args.join(' ');
        const numMatch = args[0]?.match(/^(\d+)h?$/);
        if (numMatch) {
            hours = Math.min(parseInt(numMatch[1]), 168);
            text = args.slice(1).join(' ');
        }
        text = text || '📢 Active members, check in!';

        try {
            const meta = await sock.groupMetadata(from);
            const allMembers = meta.participants.map(p => p.id);
            const activeNums = getActiveUsers(from, hours * 60 * 60 * 1000);

            // Map active numbers back to full JIDs
            const activeJids = allMembers.filter(m => activeNums.includes(m.split('@')[0]));

            if (!activeJids.length) {
                return reply(`🟢 No members were active in the last ${hours}h. Everyone's asleep or busy.`);
            }

            const tags = activeJids.map(m => `@${m.split('@')[0]}`).join(' ');
            await sock.sendMessage(from, {
                text: `🟢 *ACTIVE MEMBERS* (last ${hours}h) — ${activeJids.length}\n━━━━━━━━━━━━━━━━━━━━\n\n${text}\n\n${tags}\n━━━━━━━━━━━━━━━━━━━━`,
                mentions: activeJids,
            }, { quoted: message });
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
