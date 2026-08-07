// Auto-task scheduler for dev commands
// Stores tasks in data/auto_tasks.json and runs them on a tick loop
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isDev } from './devAccess.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TASKS_PATH = path.join(__dirname, '../../data/auto_tasks.json');

let running = false;

export function getTasks() {
    try {
        if (!fs.existsSync(TASKS_PATH)) return [];
        return JSON.parse(fs.readFileSync(TASKS_PATH, 'utf8'));
    } catch { return []; }
}

export function saveTasks(tasks) {
    fs.mkdirSync(path.dirname(TASKS_PATH), { recursive: true });
    fs.writeFileSync(TASKS_PATH, JSON.stringify(tasks, null, 2));
}

export function addTask(task) {
    const tasks = getTasks();
    task.id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    task.createdAt = Date.now();
    task.lastRun = 0;
    tasks.push(task);
    saveTasks(tasks);
    startScheduler();
    return task;
}

export function removeTask(id) {
    const tasks = getTasks().filter(t => t.id !== id);
    saveTasks(tasks);
    return tasks.length;
}

function runTask(task, sock) {
    if (!task.enabled) return;
    try {
        if (task.type === 'message') {
            sock.sendMessage(task.targetJid, { text: task.text });
        } else if (task.type === 'eval') {
            eval(task.code);
        }
    } catch {}
}

export function startScheduler() {
    if (running) return;
    running = true;
    setInterval(() => {
        const tasks = getTasks();
        const now = Date.now();
        for (const task of tasks) {
            if (!task.enabled) continue;
            // interval in minutes
            if (task.intervalMs && now - task.lastRun >= task.intervalMs) {
                task.lastRun = now;
                saveTasks(tasks);
                // get fresh sock lazily
                const sock = global.__sock;
                if (sock) runTask(task, sock);
            }
        }
    }, 15000);
}

// Auto-run on import
startScheduler();
