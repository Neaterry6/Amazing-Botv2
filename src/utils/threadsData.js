import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const DATA_FILE = path.join(path.dirname(path.dirname(path.dirname(__filename))), 'data', 'threads.json');

let _data = null;
let _dirty = false;

function load() {
    if (_data) return _data;
    try { _data = fs.readJsonSync(DATA_FILE); }
    catch { _data = {}; }
    return _data;
}

function save() {
    if (!_dirty) return;
    try {
        fs.ensureDirSync(path.dirname(DATA_FILE));
        fs.writeJsonSync(DATA_FILE, _data, { spaces: 2 });
        _dirty = false;
    } catch {}
}

setInterval(save, 4000);

function cleanId(id) {
    return String(id || '').split('@')[0].split(':')[0];
}

function defaultThread(id) {
    return {
        threadID: id,
        threadName: '',
        adminIDs: [],
        participantIDs: [],
        imageSrc: null,
        emoji: null,
        data: {},
        settings: {
            language: 'en',
            antilink: false,
            antispam: true,
            welcome: { enabled: false, message: 'Welcome {name}!' },
            goodbye: { enabled: false, message: 'Goodbye {name}!' },
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
}

function pathSet(obj, dotPath, value) {
    const keys = String(dotPath).split('.');
    let cur = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!cur[keys[i]] || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {};
        cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
}

const threadsData = {
    async create(threadID, info = {}) {
        const id = cleanId(threadID);
        if (!id) return null;
        const data = load();
        if (!data[id]) {
            data[id] = {
                ...defaultThread(id),
                threadName: info.subject || '',
                adminIDs: (info.participants || []).filter(p => p.admin).map(p => cleanId(p.id)),
                participantIDs: (info.participants || []).map(p => cleanId(p.id)),
                imageSrc: info.profilePictureUrl || null,
            };
            _dirty = true;
        }
        return data[id];
    },

    async get(threadID) {
        const id = cleanId(threadID);
        if (!id) return null;
        const data = load();
        if (!data[id]) { data[id] = defaultThread(id); _dirty = true; }
        return data[id];
    },

    async getAll() {
        return Object.values(load());
    },

    async set(threadID, updateData, dotPath = null) {
        const id = cleanId(threadID);
        if (!id) return null;
        const data = load();
        if (!data[id]) data[id] = defaultThread(id);
        if (dotPath) {
            pathSet(data[id], dotPath, updateData);
        } else {
            Object.assign(data[id], updateData);
        }
        data[id].updatedAt = Date.now();
        _dirty = true;
        return data[id];
    },

    async refreshInfo(threadID, info = {}) {
        if (!info || !Object.keys(info).length) return;
        const updates = {};
        if (info.subject) updates.threadName = info.subject;
        if (info.participants) {
            updates.adminIDs = info.participants.filter(p => p.admin).map(p => cleanId(p.id));
            updates.participantIDs = info.participants.map(p => cleanId(p.id));
        }
        if (info.profilePictureUrl) updates.imageSrc = info.profilePictureUrl;
        if (Object.keys(updates).length) await this.set(threadID, updates);
    },

    async remove(threadID) {
        const id = cleanId(threadID);
        if (!id) return;
        const data = load();
        delete data[id];
        _dirty = true;
        save();
    },

    async getSetting(threadID, key) {
        const thread = await this.get(threadID);
        return thread?.settings?.[key] ?? null;
    },

    async setSetting(threadID, key, value) {
        return await this.set(threadID, { settings: { ...(await this.get(threadID))?.settings, [key]: value } });
    },

    flush: () => { _dirty = true; save(); },
};

export default threadsData;
