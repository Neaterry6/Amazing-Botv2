import { isDev } from '../../src/utils/devAccess.js';
import { isProtected, setProtected, getProtectedGroups } from '../../src/utils/antihijack.js';

export default {
    config: {
        name: 'antihijack',
        aliases: ['protect', 'hijackprotect'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Protect groups from hijack attempts (dev only)',
        category: 'owner',
        coolDown: 5,
        role: 0,
        groupOnly: true,
        guide: {
            en: '{prefix}antihijack on — enable protection in this group\n{prefix}antihijack off — disable protection\n{prefix}antihijack status — check this group\n{prefix}antihijack list — all protected groups\n\nWhen protection is ON, anyone who tries to hijack the group (mass-demoting admins / running .hijack) gets kicked instantly.'
        },
    },

    async onStart({ args, reply, from, sender, isGroupAdmin, React }) {
        React('🛡️');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);
        if (!isGroupAdmin) return reply(`❌ The bot must be a group admin for hijack protection.`);

        const sub = (args[0] || 'status').toLowerCase();

        if (sub === 'on' || sub === 'enable' || sub === '1') {
            setProtected(from, true);
            return reply([
                `━━━━━━━━━━━━━━━━━━━━`,
                `  🛡️ *ANTI-HIJACK ON*`,
                `━━━━━━━━━━━━━━━━━━━━`,
                ``,
                `  ✅ Protection enabled for this group`,
                ``,
                `  ⚠️ Anyone who tries to hijack this group`,
                `  (mass-demote admins or run .hijack)`,
                `  will be *kicked instantly*.`,
                ``,
                `  └ Turn off: .antihijack off`,
                `━━━━━━━━━━━━━━━━━━━━`,
            ].join('\n'));
        }

        if (sub === 'off' || sub === 'disable' || sub === '0') {
            setProtected(from, false);
            return reply(`🛡️ Anti-hijack protection *disabled* for this group.`);
        }

        if (sub === 'status') {
            const on = isProtected(from);
            return reply(`🛡️ *Anti-hijack status:*\n\n${on ? '✅ *ENABLED* — this group is protected.' : '❌ *DISABLED* — this group is vulnerable.'}\n\nTurn on with: .antihijack on`);
        }

        if (sub === 'list') {
            const groups = getProtectedGroups();
            if (!groups.length) return reply(`🛡️ No groups have hijack protection enabled.`);
            let text = `🛡️ *Protected Groups*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
            for (const [id] of groups) {
                text += `  🛡️ ${id.split('@')[0]}\n`;
            }
            text += `\n━━━━━━━━━━━━━━━━━━━━`;
            return reply(text);
        }

        reply(`Unknown option. Try: on, off, status, list`);
    },
};
