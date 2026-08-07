import { getGroup, updateGroup } from '../../src/models/Group.js';

export default {
    config: {
        name: 'notify',
        aliases: ['welcometoggle', 'joinnotify'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Toggle welcome/join notifications in the group',
        category: 'admin',
        coolDown: 3,
        role: 1,
        groupOnly: true,
        guide: { en: '{prefix}notify on|off|status\n{prefix}notify set <message> — custom welcome text (use @user, @group, @members)' },
    },

    async onStart({ args, reply, from, isGroup, isGroupAdmin, React }) {
        React('🔔');
        if (!isGroup) return reply('Group only.');
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);
        const sub = args[0]?.toLowerCase();

        try {
            const group = await getGroup(from);

            if (sub === 'on' || sub === '1' || sub === 'enable') {
                await updateGroup(from, { $set: { 'settings.welcome.enabled': true } });
                return reply(`🔔 Welcome/join notifications *enabled*.\n\nSet a custom message: {prefix}notify set <text>`);
            }
            if (sub === 'off' || sub === '0' || sub === 'disable') {
                await updateGroup(from, { $set: { 'settings.welcome.enabled': false } });
                return reply(`🔕 Welcome/join notifications *disabled*.`);
            }
            if (sub === 'set') {
                const text = args.slice(1).join(' ').trim();
                if (!text) return reply(`Usage: {prefix}notify set <message>\nVariables: @user, @group, @members, @admins, @date, @time`);
                await updateGroup(from, { $set: { 'settings.welcome.enabled': true, 'settings.welcome.message': text } });
                return reply(`✅ Welcome message set.\n\n${text}`);
            }
            // status
            const enabled = group?.settings?.welcome?.enabled;
            return reply(`🔔 *Notify status:* ${enabled ? '🟢 ON' : '🔴 OFF'}\n\nToggle: {prefix}notify on|off\nCustom message: {prefix}notify set <text>`);
        } catch (err) {
            reply(`❌ Failed: ${err.message}`);
        }
    },
};
