export default {
    config: {
        name: 'couple',
        aliases: ['couplequiz', 'duo'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Test your couple compatibility',
        category: 'fun',
        coolDown: 5,
        role: 0,
        guide: { en: '{prefix}couple @user — test compatibility with someone\n{prefix}couple <name> — with a name' },
    },

    async onStart({ args, reply, message, React }) {
        React('💞');
        const mentioned = message?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        let target = 'your crush';

        if (mentioned) target = `@${mentioned.split('@')[0]}`;
        else if (args.length) target = args.join(' ');

        const score = Math.floor(Math.random() * 41) + 60; // 60-100
        const emoji = score >= 90 ? '💖' : score >= 75 ? '💕' : score >= 60 ? '💗' : '💔';

        let verdict;
        if (score >= 90) verdict = 'Soulmates! Written in the stars. ✨';
        else if (score >= 80) verdict = 'A power couple in the making!';
        else if (score >= 70) verdict = 'There is real potential here.';
        else verdict = 'It could work... with effort. 😅';

        const traits = ['loyal', 'funny', 'caring', 'adventurous', 'stubborn', 'dramatic', 'protective', 'charming'];
        const t1 = traits[Math.floor(Math.random() * traits.length)];
        const t2 = traits[Math.floor(Math.random() * traits.length)];

        reply([
            `━━━━━━━━━━━━━━━━━━━━`,
            `  💞 *COUPLE TEST*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            ``,
            `  You + ${target}`,
            `  💯 Compatibility: *${score}%* ${emoji}`,
            ``,
            `  ${verdict}`,
            ``,
            `  ✨ Your vibes: ${t1} & ${t2}`,
            ``,
            `━━━━━━━━━━━━━━━━━━━━`,
        ].join('\n'), mentioned ? [mentioned] : []);
    },
};
