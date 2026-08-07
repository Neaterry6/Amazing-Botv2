const WORDS = [
    'elephant', 'guitar', 'pyramid', 'lantern', 'journey',
    'thunder', 'puzzle', 'whisper', 'dragon', 'mountain',
    'bicycle', 'sapphire', 'tornado', 'butterfly', 'galaxy',
    'ocean', 'kingdom', 'shadow', 'sunshine', 'treasure',
    'voyage', 'horizon', 'diamond', 'crystal', 'midnight',
];

const games = new Map();

function display(word, guessed) {
    return word.split('').map(ch => (guessed.has(ch) ? ch : '⬜')).join(' ');
}

export default {
    config: {
        name: 'hangman',
        aliases: ['hm'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Guess the word before you run out of chances',
        category: 'games',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}hangman — start\n{prefix}hangman <letter> — guess\n{prefix}hangman hint — reveal a letter' },
    },

    async onStart({ args, reply, sender, pushName, React }) {
        React('🎯');
        const guess = args[0]?.toLowerCase();

        // Start
        if (!guess || guess === 'start') {
            if (games.has(sender)) return reply(`🎯 You already have a game! Guess a letter or use .hangman hint`);
            const word = WORDS[Math.floor(Math.random() * WORDS.length)];
            games.set(sender, { word, guessed: new Set(), wrong: 0, maxWrong: 6 });
            return reply([
                `━━━━━━━━━━━━━━━━━━━━`,
                `  🎯 *HANGMAN*`,
                `━━━━━━━━━━━━━━━━━━━━`,
                ``,
                `  Word: ${display(word, new Set())}`,
                `  ❌ Wrong: 0/6`,
                ``,
                `  Guess a letter: .hangman <letter>`,
                `  Hint: .hangman hint`,
                `━━━━━━━━━━━━━━━━━━━━`,
            ].join('\n'));
        }

        const game = games.get(sender);
        if (!game) return reply(`❌ No active game. Start with: .hangman`);

        // Hint
        if (guess === 'hint') {
            const unrevealed = [...game.word].filter(ch => !game.guessed.has(ch));
            if (!unrevealed.length) return reply(`All letters revealed! Guess the word or it's over.`);
            const hintLetter = unrevealed[Math.floor(Math.random() * unrevealed.length)];
            game.guessed.add(hintLetter);
            game.wrong += 1;
            return render(sender, games, reply, '💡 Hint revealed');
        }

        // Guess a full word
        if (guess.length > 1) {
            if (guess === game.word) {
                games.delete(sender);
                return reply(`🎉 *CORRECT!* You guessed the word: *${game.word.toUpperCase()}*\n\n+25 XP!`);
            }
            game.wrong += 1;
            if (game.wrong >= game.maxWrong) {
                games.delete(sender);
                return reply(`💀 *GAME OVER* — too many wrong guesses.\nThe word was: *${game.word.toUpperCase()}*`);
            }
            return render(sender, games, reply, `❌ "${guess}" is wrong`);
        }

        // Single letter
        const letter = guess[0];
        if (!/^[a-z]$/.test(letter)) return reply(`Enter a single letter.`);
        if (game.guessed.has(letter)) return reply(`You already guessed "${letter}".`);

        game.guessed.add(letter);
        if (!game.word.includes(letter)) {
            game.wrong += 1;
        }

        // Win check
        if ([...game.word].every(ch => game.guessed.has(ch))) {
            games.delete(sender);
            return reply(`🎉 *YOU WON!*\nWord: *${game.word.toUpperCase()}*\nWrong guesses: ${game.wrong}/6\n\n+25 XP!`);
        }

        // Lose check
        if (game.wrong >= game.maxWrong) {
            games.delete(sender);
            return reply(`💀 *GAME OVER*\nThe word was: *${game.word.toUpperCase()}*`);
        }

        return render(sender, games, reply);
    },
};

function render(userId, games, reply, note = '') {
    const game = games.get(userId);
    const word = game.word;
    const guessedLetters = [...game.guessed].filter(ch => word.includes(ch));
    const wrongLetters = [...game.guessed].filter(ch => !word.includes(ch));

    const stages = [
        '    ┌──┐\n    │  │\n       │\n       │\n       │\n      ┌┴┐',
        '    ┌──┐\n    │  │\n    😵 │\n       │\n       │\n      ┌┴┐',
        '    ┌──┐\n    │  │\n    😵 │\n    ─┼─ │\n       │\n      ┌┴┐',
        '    ┌──┐\n    │  │\n    😵 │\n   ─┼─  │\n    ┌┘  │\n      ┌┴┐',
        '    ┌──┐\n    │  │\n    😵 │\n   ─┼─  │\n   ┌┘└┐ │\n      ┌┴┐',
        '    ┌──┐\n    │  │\n    💀 │\n   ─┼─  │\n   ┌┘└┐ │\n   └───┘',
    ];
    const stage = stages[Math.min(game.wrong, 5)];

    let out = `━━━━━━━━━━━━━━━━━━━━\n  🎯 *HANGMAN*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
    if (note) out += `  ${note}\n\n`;
    out += `  \`\`\`${stage}\`\`\`\n\n`;
    out += `  Word: ${display(word, game.guessed)}\n`;
    out += `  ❌ Wrong (${game.wrong}/${game.maxWrong}): ${wrongLetters.join(', ') || 'none'}\n`;
    out += `  ✅ Found: ${guessedLetters.join(', ') || 'none'}\n`;
    out += `\n  ▸ .hangman <letter>\n  ▸ .hangman hint\n━━━━━━━━━━━━━━━━━━━━`;

    return reply(out);
}
