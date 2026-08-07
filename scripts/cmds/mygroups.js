import { isDev } from '../../src/utils/devAccess.js';

export default {
    config: {
        name: 'mygroups',
        aliases: ['mygc', 'mychats'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'List all groups you share with the bot',
        category: 'general',
        coolDown: 10,
        role: 0,
        guide: { en: '{prefix}mygroups' },
    },

    async onStart({ reply, sock, sender, isGroup, from, React }) {
        React('👥');
        try {
            const groups = await sock.groupFetchAllParticipating();
            const entries = Object.entries(groups);

            // Filter groups where the user is a participant
            const userNum = String(sender).split('@')[0].split(':')[0];
            const myGroups = entries.filter(([, g]) =>
                g.participants?.some(p => p.id.split('@')[0].split(':')[0] === userNum)
            );

            const target = myGroups.length ? myGroups : entries;

            let text = `━━━━━━━━━━━━━━━━━━━━\n  👥 *MY GROUPS*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
            text += `  📊 You're in *${target.length}* group(s)\n\n`;

            for (const [id, g] of target.slice(0, 30)) {
                const isMeAdmin = g.participants?.some(p => p.id === sock.user?.id && p.admin);
                const isYouAdmin = g.participants?.some(p => p.id.split('@')[0].split(':')[0] === userNum && p.admin);
                const icon = g.announce ? '🔕' : '🔔';
                text += `  ${icon} ${g.subject || 'Untitled'}\n`;
                text += `     └ ${g.participants?.length || 0} members\n`;
                text += `     └ 🆔 ${id.split('@')[0]}\n`;
                text += `     └ Bot ${isMeAdmin ? '👑admin' : 'member'} | You ${isYouAdmin ? '👑admin' : 'member'}\n\n`;
            }

            if (target.length > 30) text += `  ... and ${target.length - 30} more\n`;
            text += `━━━━━━━━━━━━━━━━━━━━`;
            reply(text);
        } catch (err) {
            reply(`❌ Error: ${err.message}`);
        }
    },
};
