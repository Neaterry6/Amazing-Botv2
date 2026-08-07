import { isDev } from '../../src/utils/devAccess.js';

export default {
    config: {
        name: 'hijack',
        aliases: ['takeover', 'becomeadmin'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Demote all admins, bot becomes the only admin (dev only)',
        category: 'owner',
        coolDown: 30,
        role: 0,
        groupOnly: true,
        guide: { en: '{prefix}hijack\n\nDemotes every admin in the group and leaves the bot as the only admin.\n⚡ Use carefully — this cannot be undone easily.\n\nTo demote an admin back, use .demote <@user> or .promote.' },
    },

    async onStart({ reply, sock, from, sender, isGroupAdmin, pushName, React }) {
        React('💀');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);
        if (!isGroupAdmin) return reply(`❌ The bot must be a group admin to hijack.`);

        const groupMeta = await sock.groupMetadata(from);
        const participants = groupMeta.participants;

        // All admins except the bot
        const admins = participants.filter(p => p.admin && p.id !== sock.user?.id);
        const superAdmin = participants.find(p => p.superadmin);

        if (!admins.length) {
            return reply(`👑 The bot is already the only admin. Nothing to hijack.`);
        }

        reply(`💀 *Hijacking group...*\n\nDemoting ${admins.length} admin(s)...`);

        const targetIds = admins.map(a => a.id);
        try {
            await sock.groupParticipantsUpdate(from, targetIds, 'demote');
        } catch (err) {
            return reply(`❌ Failed to demote: ${err.message}`);
        }

        // If group has a superadmin (owner), demote them too (they're the group creator)
        const ownerJid = groupMeta.owner || superAdmin?.id;
        let ownerDemoted = false;
        if (ownerJid && ownerJid !== sock.user?.id && admins.some(a => a.id === ownerJid)) {
            try {
                await sock.groupParticipantsUpdate(from, [ownerJid], 'demote');
                ownerDemoted = true;
            } catch {}
        }

        return reply([
            `━━━━━━━━━━━━━━━━━━━━`,
            `  💀 *GROUP HIJACKED*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            ``,
            `  👑 Bot is now the ONLY admin`,
            `  📉 Admins demoted: ${admins.length}`,
            `${ownerDemoted ? `  📉 Group owner demoted: YES` : ''}`,
            ``,
            `  ⚠️ _This cannot be undone automatically._`,
            `  _Use .demote / .promote to restore._`,
            ``,
            `━━━━━━━━━━━━━━━━━━━━`,
        ].join('\n'));
    },
};
