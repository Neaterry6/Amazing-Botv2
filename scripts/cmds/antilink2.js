import { setGroupAntilink, getGroupAntilink } from '../../src/utils/antilinkStore.js';

export default {
    config: {
        name: 'antilink2',
        aliases: ['antilink', 'protectlinks'],
        author: 'Broken_vzn',
        version: '2.0',
        shortDescription: 'Toggle antilink protection for the group',
        category: 'admin',
        groupOnly: true,
        coolDown: 3,
        role: 1,
        guide: { en: '{prefix}antilink2 on|off\n{prefix}antilink2 status' },
    },
    async onStart({ args, reply, from, isGroupAdmin, React }) {
        React('🛡️');
        if (!isGroupAdmin) return reply(`❌ Only group admins can use this.`);
        const s = args[0]?.toLowerCase();

        if (s === 'on') {
            await setGroupAntilink(from, true, 'delete');
            return reply(`🛡️ *Antilink: ✅ Enabled*\nLinks will be deleted in this group.`);
        }
        if (s === 'off') {
            await setGroupAntilink(from, false);
            return reply(`🛡️ *Antilink: ❌ Disabled*\nLinks are allowed again.`);
        }
        if (s === 'status' || !s) {
            const cur = await getGroupAntilink(from);
            return reply(`🛡️ *Antilink status:* ${cur?.enabled ? '✅ Enabled' : '❌ Disabled'}\n\nTurn on: {prefix}antilink2 on`);
        }
        return reply(`Usage: {prefix}antilink2 on|off|status`);
    },
};
