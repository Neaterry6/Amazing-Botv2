const games = new Map();

const ITEMS = [
    { name: 'iPhone 15 Pro', price: 999, hint: 'Apple' },
    { name: 'Air Jordan 1', price: 180, hint: 'Sneaker' },
    { name: 'Tesla Model 3', price: 38990, hint: 'Electric car' },
    { name: 'PS5', price: 499, hint: 'Sony console' },
    { name: 'Gold Bar (1kg)', price: 65000, hint: 'Bullion' },
    { name: 'Nintendo Switch', price: 299, hint: 'Console' },
    { name: 'MacBook Pro 14"', price: 1999, hint: 'Laptop' },
    { name: 'AirPods Pro', price: 249, hint: 'Earbuds' },
    { name: 'Bicycle', price: 400, hint: 'Transport' },
    { name: 'Samsung S24 Ultra', price: 1299, hint: 'Android phone' },
    { name: 'RTX 4090', price: 1599, hint: 'GPU' },
    { name: 'Dyson V15 Vacuum', price: 749, hint: 'Home appliance' },
    { name: 'Rolex Submariner', price: 9000, hint: 'Luxury watch' },
    { name: 'Fender Stratocaster', price: 1200, hint: 'Guitar' },
    { name: 'Steam Deck OLED', price: 649, hint: 'Handheld' },
    { name: 'Peloton Bike', price: 1445, hint: 'Fitness' },
    { name: 'FujiFilm X-T5', price: 1699, hint: 'Camera' },
    { name: 'Dyson Airwrap', price: 599, hint: 'Hair tool' },
];

export default {
    config: {
        name: 'higherlower',
        aliases: ['hl', 'guessprice'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Guess if the next item is higher or lower priced',
        category: 'games',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}higherlower — start\n{prefix}higherlower higher / h\n{prefix}higherlower lower / l\n{prefix}higherlower quit' },
    },

    async onStart({ args, reply, sender, React }) {
        React('📈');
        const cmd = args[0]?.toLowerCase();

        // Start
        if (!cmd || cmd === 'start') {
            if (games.has(sender)) return reply(`📈 You're already playing! Type higher or lower.`);
            const idx = Math.floor(Math.random() * ITEMS.length);
            games.set(sender, {
                idx,
                streak: 0,
                best: 0,
                history: [],
            });
            return render(sender, games, reply);
        }

        const game = games.get(sender);
        if (!game) return reply(`📈 No active game. Start with: .higherlower`);

        if (cmd === 'quit' || cmd === 'q' || cmd === 'end') {
            games.delete(sender);
            return reply(`🏁 Game ended. Best streak: *${game.best}*`);
        }

        if (cmd !== 'higher' && cmd !== 'h' && cmd !== 'lower' && cmd !== 'l') {
            return reply(`Guess: .higherlower higher  or  .higherlower lower`);
        }

        const cur = ITEMS[game.idx];
        const guessHigher = cmd === 'higher' || cmd === 'h';

        // Pick next item
        let nextIdx;
        do {
            nextIdx = Math.floor(Math.random() * ITEMS.length);
        } while (nextIdx === game.idx);
        const next = ITEMS[nextIdx];

        const correct = guessHigher ? next.price >= cur.price : next.price <= cur.price;

        game.history.push({ name: cur.name, price: cur.price, guess: guessHigher ? '▲' : '▼' });

        if (correct) {
            game.streak++;
            game.best = Math.max(game.best, game.streak);
            game.idx = nextIdx;
            return render(sender, games, reply, `✅ *Correct!* ${cur.name} was *$${cur.price.toLocaleString()}*`);
        } else {
            games.delete(sender);
            let out = `━━━━━━━━━━━━━━━━━━━━\n  📈 *GAME OVER* ❌\n━━━━━━━━━━━━━━━━━━━━\n\n`;
            out += `  ${cur.name}: *$${cur.price.toLocaleString()}*\n`;
            out += `  ${next.name}: *$${next.price.toLocaleString()}*\n`;
            out += `  You guessed ${guessHigher ? '▲ higher' : '▼ lower'} — wrong!\n`;
            out += `\n  🔥 Final streak: *${game.streak}*\n  🏆 Best: *${game.best}*\n`;
            out += `\n━━━━━━━━━━━━━━━━━━━━`;
            return reply(out);
        }
    },
};

function render(userId, games, reply, note = '') {
    const game = games.get(userId);
    const item = ITEMS[game.idx];

    let out = `━━━━━━━━━━━━━━━━━━━━\n  📈 *HIGHER OR LOWER*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    if (note) out += `  ${note}\n\n`;
    out += `  🛒 *${item.name}*\n`;
    out += `  💡 ${item.hint}\n`;
    out += `  💲 Price: *$${item.price.toLocaleString()}*\n\n`;
    out += `  🔥 Streak: *${game.streak}*\n\n`;
    out += `  Is the *next* item priced higher or lower?\n`;
    out += `  ▸ .higherlower higher\n  ▸ .higherlower lower\n`;
    out += `  ▸ .higherlower quit\n`;
    out += `━━━━━━━━━━━━━━━━━━━━`;
    return reply(out);
}
