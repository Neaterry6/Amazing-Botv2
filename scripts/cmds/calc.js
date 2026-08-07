export default {
    config: {
        name: 'calc',
        aliases: ['calculator', 'math'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Calculate math expressions',
        category: 'utility',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}calc <expression>' },
    },

    async onStart({ args, reply, prefix, React }) {
        React('🧮');
        if (!args.length) return reply(`Usage: ${prefix}calc <expression>\nExample: ${prefix}calc 2+2*3`);

        const expr = args.join(' ');
        try {
            // sanitize - only allow numbers, operators, parentheses, decimals
            if (!/^[\d\s+\-*/().%^]+$/.test(expr)) {
                return reply(`❌ Invalid expression. Only numbers and math operators allowed.`);
            }

            const safeExpr = expr.replace(/\^/g, '**');
            const result = Function(`"use strict"; return (${safeExpr})`)();

            reply([
                `━━━━━━━━━━━━━━━━━━━━`,
                `  🧮 *CALCULATOR*`,
                `━━━━━━━━━━━━━━━━━━━━`,
                ``,
                `  📝 Expression: \`${expr}\``,
                `  ✅ Result: *${result}*`,
                ``,
                `━━━━━━━━━━━━━━━━━━━━`,
            ].join('\n'));
        } catch {
            reply(`❌ Invalid expression: ${expr}`);
        }
    },
};
