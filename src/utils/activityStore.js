import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../../data/activity.json');

function load() {
    try {
        fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
        return fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) : {};
    } catch { return {}; }
}
function save(d) { fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true }); fs.writeFileSync(DATA_PATH, JSON.stringify(d, null, 2)); }

// Track message activity per group+user
export function trackActivity(groupId, userId) {
    const d = load();
    if (!d[groupId]) d[groupId] = {};
    d[groupId][userId] = Date.now();
    save(d);
}

export function getActiveUsers(groupId, withinMs = 24 * 60 * 60 * 1000) {
    const d = load()[groupId] || {};
    const cutoff = Date.now() - withinMs;
    return Object.entries(d)
        .filter(([, ts]) => ts >= cutoff)
        .map(([id]) => id);
}
