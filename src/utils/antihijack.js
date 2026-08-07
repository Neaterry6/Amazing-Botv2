// Anti-hijack protection store
// Tracks which groups have hijack protection enabled
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../../data/antihijack.json');

let store = null;

function ensureDir() {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function load() {
    if (store) return store;
    ensureDir();
    try {
        store = fs.existsSync(DATA_PATH) ? JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) : {};
    } catch {
        store = {};
    }
    return store;
}

function save() {
    ensureDir();
    fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2));
}

export function isProtected(groupId) {
    const s = load();
    return !!s[groupId]?.enabled;
}

export function setProtected(groupId, enabled) {
    const s = load();
    if (!s[groupId]) s[groupId] = {};
    s[groupId].enabled = enabled;
    s[groupId].updatedAt = Date.now();
    save();
}

export function getProtectedGroups() {
    return Object.entries(load()).filter(([, v]) => v.enabled);
}
