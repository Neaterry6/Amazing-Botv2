import { isDev } from '../../src/utils/devAccess.js';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';

export default {
    config: {
        name: 'health',
        aliases: ['syshealth', 'panel', 'server'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Full system health dashboard (dev only)',
        category: 'owner',
        coolDown: 5,
        role: 0,
        guide: { en: '{prefix}health' },
    },

    async onStart({ reply, sender, sock, React }) {
        React('💚');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);

        try {
            // CPU + Load
            const cpus = os.cpus();
            const loadAvg = os.loadavg();
            const cpuCount = cpus.length;
            const loadPct = Math.round((loadAvg[0] / cpuCount) * 100);

            // Memory
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            const memPct = Math.round((usedMem / totalMem) * 100);

            // Uptime
            const bootUptime = os.uptime();
            const bootDays = Math.floor(bootUptime / 86400);
            const bootHours = Math.floor((bootUptime % 86400) / 3600);

            // Process
            const procMem = process.memoryUsage();
            const procUptime = process.uptime();

            // Disk
            let diskInfo = 'N/A';
            try {
                const df = execSync('df -h / | tail -1', { encoding: 'utf8' }).trim().split(/\s+/);
                diskInfo = `${df[4] || '?'} used (${df[2] || '?'}/${df[1] || '?'})`;
            } catch {}

            // Connection
            const conn = sock?.ws?.readyState === 1 ? '🟢 Connected' : '🔴 Disconnected';

            // Bottleneck detection
            let status = '✅ Healthy';
            if (memPct > 85 || loadPct > 150) status = '⚠️ High load';

            reply([
                `━━━━━━━━━━━━━━━━━━━━`,
                `  💚 *SYSTEM HEALTH*`,
                `━━━━━━━━━━━━━━━━━━━━`,
                ``,
                `  Overall: ${status}`,
                `  WhatsApp: ${conn}`,
                ``,
                `  🖥️ *CPU*`,
                `  ├ Cores: ${cpuCount}`,
                `  ├ Load (1m): ${loadAvg[0].toFixed(2)} (${loadPct}%)`,
                `  └ Model: ${cpus[0]?.model || 'N/A'}`,
                ``,
                `  💾 *Memory*`,
                `  ├ Used: ${(usedMem / 1024 / 1024 / 1024).toFixed(1)} GB`,
                `  ├ Free: ${(freeMem / 1024 / 1024 / 1024).toFixed(1)} GB`,
                `  └ Total: ${(totalMem / 1024 / 1024 / 1024).toFixed(1)} GB (${memPct}%)`,
                ``,
                `  📦 *Process*`,
                `  ├ Node: ${process.version}`,
                `  ├ Heap: ${(procMem.heapUsed / 1024 / 1024).toFixed(1)} MB`,
                `  └ Uptime: ${Math.floor(procUptime / 60)}m`,
                ``,
                `  💽 *Disk*`,
                `  └ ${diskInfo}`,
                ``,
                `  ⏱️ *Server Up:* ${bootDays}d ${bootHours}h`,
                `  🌐 Host: ${os.hostname()} (${os.platform()})`,
                ``,
                `━━━━━━━━━━━━━━━━━━━━`,
            ].join('\n'));
        } catch (err) {
            reply(`❌ Error: ${err.message}`);
        }
    },
};
