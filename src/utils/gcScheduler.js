// Group open/close time scheduler
// Stores schedules in data/gc_schedule.json and toggles group settings at set times
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../../data/gc_schedule.json');

let store = null;
let timer = null;

function ensureDir() { fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true }); }
function load() {
    if (store) return store;
    ensureDir();
    try { store = fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) : {}; }
    catch { store = {}; }
    return store;
}
function save() { ensureDir(); fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2)); }

export function getSchedule(groupId) {
    return load()[groupId] || null;
}

export function setSchedule(groupId, schedule) {
    const s = load();
    s[groupId] = schedule;
    save();
    startScheduler();
}

export function clearSchedule(groupId) {
    const s = load();
    delete s[groupId];
    save();
}

export function getAllSchedules() {
    return Object.entries(load());
}

function parseTime(t) {
    // Accept "HH:MM" (24h) or "9:00 PM"
    if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(t)) {
        const match = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        let h = parseInt(match[1]) % 12;
        if (match[3].toUpperCase() === 'PM') h += 12;
        return { h, m: parseInt(match[2]) };
    }
    const parts = t.split(':');
    return { h: parseInt(parts[0]), m: parseInt(parts[1] || '0') };
}

export function startScheduler() {
    if (timer) return;
    timer = setInterval(async () => {
        const s = load();
        const now = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();

        for (const [groupId, sched] of Object.entries(s)) {
            if (!sched?.openTime && !sched?.closeTime) continue;
            // We only trigger once per minute; track lastExec to avoid repeats
            const minuteKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;

            try {
                const sock = global.__sock;
                if (!sock) continue;

                // Open time
                if (sched.openTime) {
                    const t = parseTime(sched.openTime);
                    if (t.h === now.getHours() && t.m === now.getMinutes() && sched.lastOpen !== minuteKey) {
                        await sock.groupSettingUpdate(groupId, 'not_announcement');
                        sched.lastOpen = minuteKey;
                        save();
                        try { await sock.sendMessage(groupId, { text: '🔓 *Group Opened* — everyone can chat now!' }); } catch {}
                    }
                }

                // Close time
                if (sched.closeTime) {
                    const t = parseTime(sched.closeTime);
                    if (t.h === now.getHours() && t.m === now.getMinutes() && sched.lastClose !== minuteKey) {
                        await sock.groupSettingUpdate(groupId, 'announcement');
                        sched.lastClose = minuteKey;
                        save();
                        try { await sock.sendMessage(groupId, { text: '🔒 *Group Closed* — only admins can chat now!' }); } catch {}
                    }
                }
            } catch {}
        }
    }, 30000);
}

// Start on import
startScheduler();
