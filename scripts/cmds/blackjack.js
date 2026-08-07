import { getEco, saveEco, fmtCoins } from '../../src/utils/economyDB.js';

const games = new Map();

const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function makeDeck() {
    const deck = [];
    for (const s of SUITS) for (const v of VALUES) deck.push({ suit: s, value: v });
    return deck;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function cardValue(card) {
    if (card.value === 'A') return 11;
    if (['K', 'Q', 'J'].includes(card.value)) return 10;
    return parseInt(card.value);
}

function handValue(hand) {
    let val = hand.reduce((s, c) => s + cardValue(c), 0);
    let aces = hand.filter(c => c.value === 'A').length;
    while (val > 21 && aces > 0) { val -= 10; aces--; }
    return val;
}

function handStr(hand, hide = false) {
    if (hide) return `${hand[0].value}${hand[0].suit} 🂠`;
    return hand.map(c => `${c.value}${c.suit}`).join(' ');
}

export default {
    config: {
        name: 'blackjack',
        aliases: ['bj', '21'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Play Blackjack vs the dealer',
        category: 'games',
        coolDown: 3,
        role: 0,
        guide: {
            en: '{prefix}blackjack <bet> — start a game\n{prefix}blackjack hit — take a card\n{prefix}blackjack stand — end your turn\n{prefix}blackjack fold — give up'
        },
    },

    async onStart({ args, reply, sender, pushName, React }) {
        React('🃏');
        const sub = args[0]?.toLowerCase();
        const eco = getEco(sender);

        // Start
        if (!sub || sub === 'start' || !['hit', 'stand', 'fold', 'double'].includes(sub)) {
            if (games.has(sender)) return reply(`♠️ You're already in a game! Reply with .blackjack hit or .blackjack stand`);

            const betStr = args[0];
            const bet = parseInt(betStr) || 100;
            if (isNaN(bet) || bet <= 0) return reply(`❌ Enter a valid bet: .blackjack <amount>`);
            if (eco.wallet < bet) return reply(`❌ You only have ${fmtCoins(eco.wallet)}. Bet too high.`);

            const deck = shuffle(makeDeck());
            const player = [deck.pop(), deck.pop()];
            const dealer = [deck.pop()];

            games.set(sender, {
                deck, player, dealer,
                bet,
                done: false,
                playerName: pushName || sender.split('@')[0],
            });

            let out = `━━━━━━━━━━━━━━━━━━━━\n  🃏 *BLACKJACK*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
            out += `  🧑 Player: ${handStr(player)} = *${handValue(player)}*\n`;
            out += `  🤵 Dealer: ${handStr(dealer, true)}\n`;
            out += `\n  💰 Bet: ${fmtCoins(bet)}\n`;
            out += `  📊 Wallet: ${fmtCoins(eco.wallet)}\n\n`;
            out += `  ▸ .blackjack hit\n  ▸ .blackjack stand\n`;
            out += `━━━━━━━━━━━━━━━━━━━━`;

            // Check natural blackjack
            if (handValue(player) === 21) {
                return endGame(sender, 'player', 'Natural Blackjack! 🎉', games, reply, eco);
            }

            return reply(out);
        }

        const game = games.get(sender);
        if (!game) return reply(`❌ No active game. Start one with: .blackjack <bet>`);

        if (sub === 'hit') {
            game.player.push(game.deck.pop());
            const val = handValue(game.player);
            if (val > 21) return endGame(sender, 'dealer', `Bust! You went over 21. 💥`, games, reply, eco);
            if (val === 21) return endGame(sender, 'player', 'Blackjack! 🎉', games, reply, eco);

            let out = `🃏 You drew: *${game.player[game.player.length - 1].value}${game.player[game.player.length - 1].suit}*\n`;
            out += `🧑 Your hand: ${handStr(game.player)} = *${val}*\n`;
            out += `🤵 Dealer: ${handStr(game.dealer, true)}\n`;
            out += `\n▸ .blackjack hit\n▸ .blackjack stand`;
            return reply(out);
        }

        if (sub === 'stand') {
            // Dealer plays
            while (handValue(game.dealer) < 17) game.dealer.push(game.deck.pop());
            const dVal = handValue(game.dealer);
            const pVal = handValue(game.player);

            let winner, msg;
            if (dVal > 21) { winner = 'player'; msg = 'Dealer busted! 🎉'; }
            else if (dVal > pVal) { winner = 'dealer'; msg = 'Dealer wins. 😞'; }
            else if (dVal < pVal) { winner = 'player'; msg = 'You win! 🎉'; }
            else { winner = 'push'; msg = 'Push. Money back. 🤝'; }

            return endGame(sender, winner, msg, games, reply, eco, `\n🤵 Dealer: ${handStr(game.dealer)} = *${dVal}*\n🧑 Player: ${handStr(game.player)} = *${pVal}*`);
        }

        if (sub === 'fold') {
            games.delete(sender);
            return reply(`🏳️ You folded. Bet lost.`);
        }
    },
};

function endGame(userId, winner, msg, games, reply, eco, extra = '') {
    const game = games.get(userId);
    if (!game || game.done) return;
    game.done = true;
    games.delete(userId);

    const bet = game.bet;
    let result = '';

    if (winner === 'player') {
        eco.wallet += bet;
        result = `+${fmtCoins(bet)}`;
    } else if (winner === 'dealer') {
        eco.wallet -= bet;
        result = `-${fmtCoins(bet)}`;
    } else {
        result = `±0`;
    }

    if (eco.wallet < 0) eco.wallet = 0;
    saveEco(userId, eco);

    return reply([
        `━━━━━━━━━━━━━━━━━━━━`,
        `  🃏 *GAME OVER*`,
        `━━━━━━━━━━━━━━━━━━━━`,
        ``,
        `  ${msg}${extra}`,
        ``,
        `  💰 Result: ${result}`,
        `  📊 Wallet: ${fmtCoins(eco.wallet)}`,
        ``,
        `  ▸ Play again: .blackjack <bet>`,
        `━━━━━━━━━━━━━━━━━━━━`,
    ].join('\n'));
}
