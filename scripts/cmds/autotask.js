import { isDev } from '../../src/utils/devAccess.js';
import { getTasks, addTask, removeTask, saveTasks } from '../../src/utils/autoTask.js';

export default {
    config: {
        name: 'autotask',
        aliases: ['task', 'scheduler'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Schedule automated tasks (dev only)',
        category: 'owner',
        coolDown: 3,
        role: 0,
        guide: {
            en: '{prefix}autotask add <jid> <minutes> <text>\n{prefix}autotask del <id>\n{prefix}autotask list\n{prefix}autotask toggle <id>\n{prefix}autotask clear'
        },
    },

    async onStart({ args, reply, sender, sock, from, React }) {
        React('⏰');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);
        const sub = args[0]?.toLowerCase();

        try {
            if (sub === 'list' || !sub) {
                const tasks = getTasks();
                if (!tasks.length) return reply(`⏰ No auto tasks scheduled.\n\nAdd one:\n{prefix}autotask add <jid> <interval_min> <text>`);
                let out = `━━━━━━━━━━━━━━━━━━━━\n  ⏰ *AUTO TASKS*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
                for (const t of tasks) {
                    const state = t.enabled === false ? '🔴' : '🟢';
                    out += `${state} *${t.id}*\n`;
                    out += `   ▸ Type: ${t.type}\n`;
                    out += `   ▸ Interval: ${Math.round((t.intervalMs||0)/60000)} min\n`;
                    out += `   ▸ Target: ${t.targetJid || 'N/A'}\n`;
                    if (t.text) out += `   ▸ ${t.text.substring(0, 50)}\n`;
                    out += `\n`;
                }
                out += `━━━━━━━━━━━━━━━━━━━━`;
                return reply(out);
            }

            if (sub === 'add') {
                const jid = args[1];
                const minutes = parseFloat(args[2]);
                const text = args.slice(3).join(' ');
                if (!jid || !minutes || !text) return reply(`Usage: {prefix}autotask add <jid> <minutes> <text>`);
                const task = addTask({
                    type: 'message',
                    enabled: true,
                    intervalMs: minutes * 60000,
                    targetJid: jid.includes('@') ? jid : `${jid}@s.whatsapp.net`,
                    text,
                });
                return reply(`✅ *Auto task scheduled:*\n\n🆔 ${task.id}\n⏰ Every ${minutes} min\n📤 → ${task.targetJid}\n📝 ${text}`);
            }

            if (sub === 'del' || sub === 'delete' || sub === 'remove') {
                const id = args[1];
                if (!id) return reply(`Usage: {prefix}autotask del <id>`);
                const remaining = removeTask(id);
                return reply(`🗑️ Task ${id} deleted. ${remaining} tasks remaining.`);
            }

            if (sub === 'toggle') {
                const id = args[1];
                if (!id) return reply(`Usage: {prefix}autotask toggle <id>`);
                const tasks = getTasks();
                const t = tasks.find(t => t.id === id);
                if (!t) return reply(`❌ Task not found: ${id}`);
                t.enabled = t.enabled === false;
                saveTasks(tasks);
                return reply(`✅ Task ${id} ${t.enabled ? 'enabled 🟢' : 'disabled 🔴'}`);
            }

            if (sub === 'clear') {
                saveTasks([]);
                return reply(`🧹 All auto tasks cleared.`);
            }

            reply(`Unknown subcommand. Try: list, add, del, toggle, clear`);
        } catch (err) {
            reply(`❌ Error: ${err.message}`);
        }
    },
};
