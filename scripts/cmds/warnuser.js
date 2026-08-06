import fs from 'fs-extra'; import path from 'path';
const F = path.join(process.cwd(), 'data', 'warns.json');
function load() { try { return fs.readJsonSync(F); } catch { return {}; } }
function save(d) { fs.ensureDirSync(path.dirname(F)); fs.writeJsonSync(F, d, { spaces: 2 }); }
function key(g, u) { return `${g.split('@')[0]}::${u.split('@')[0].split(':')[0]}`; }
export default {
    config: { name: 'warn', aliases: ['warning'], author: 'Raphael Ilom', version: '1.0',
        shortDescription: 'Warn a member (3 warnings = kick)', category: 'admin', coolDown: 3, role: 1,
        guide: { en: '{prefix}warn @user [reason] | warn reset @user | warn list' } },
    async onStart({ sock, message, args, from, reply, isGroup, isGroupAdmin, isBotAdmin }) {
        if (!isGroup) return reply('Group only.');
        if (!isGroupAdmin) return reply('Admin only.');
        const sub = (args[0] || '').toLowerCase();
        const ctx = message.message?.extendedTextMessage?.contextInfo;
        const mentions = ctx?.mentionedJid || [];
        if (sub === 'list') {
            const d = load(); const gid = from.split('@')[0];
            const list = Object.entries(d).filter(([k]) => k.startsWith(gid+'::'));
            if (!list.length) return reply('No warnings in this group.');
            return reply('Warnings:\n' + list.map(([k, v]) => `@${k.split('::')[1]} - ${v.count} warn(s)`).join('\n'));
        }
        if (sub === 'reset') {
            const t = ctx?.participant || mentions[0]; if (!t) return reply('Mention someone.');
            const d = load(); delete d[key(from, t)]; save(d);
            return reply(`Warnings reset for @${t.split('@')[0]}.`);
        }
        const target = ctx?.participant || mentions[0];
        if (!target) return reply('Reply to or mention someone to warn.');
        const reason = args.slice(1).join(' ') || 'No reason given';
        const d = load(); const k = key(from, target);
        if (!d[k]) d[k] = { count: 0, reasons: [] };
        d[k].count++; d[k].reasons.push(reason); save(d);
        const count = d[k].count;
        if (count >= 3) {
            delete d[k]; save(d);
            try { await sock.groupParticipantsUpdate(from, [target], 'remove'); } catch {}
            return sock.sendMessage(from, { text: `@${target.split('@')[0]} kicked after 3 warnings.`, mentions: [target] }, { quoted: message });
        }
        sock.sendMessage(from, { text: `Warning ${count}/3 for @${target.split('@')[0]}\nReason: ${reason}${count === 2 ? '\nOne more warning = kick.' : ''}`, mentions: [target] }, { quoted: message });
    },
};
