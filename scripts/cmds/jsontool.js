import { isDev } from '../../src/utils/devAccess.js';

export default {
    config: {
        name: 'jsontool',
        aliases: ['json', 'jsonfmt'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Format or validate JSON (dev only)',
        category: 'owner',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}jsontool <json>' },
    },

    async onStart({ args, reply, sender, React }) {
        React('🧩');
        if (!isDev(sender)) return reply(`❌ Developer-only command.`);
        if (!args.length) return reply(`Usage: {prefix}jsontool <json>`);

        const input = args.join(' ').trim();
        try {
            const parsed = JSON.parse(input);
            const pretty = JSON.stringify(parsed, null, 2);
            const keys = Array.isArray(parsed)
                ? `Array of ${parsed.length} items`
                : Object.keys(parsed).join(', ');
            reply([
                `━━━━━━━━━━━━━━━━━━━━`,
                `  🧩 *JSON VALID* ✅`,
                `━━━━━━━━━━━━━━━━━━━━`,
                ``,
                `  📊 Type: ${Array.isArray(parsed) ? 'Array' : typeof parsed}`,
                `  🗂️ Keys: ${keys}`,
                ``,
                `  📄 Pretty-printed:`,
                `  \`\`\``,
                `  ${pretty.length > 1800 ? pretty.substring(0, 1800) + '\n...' : pretty}`,
                `  \`\`\``,
                ``,
                `━━━━━━━━━━━━━━━━━━━━`,
            ].join('\n'));
        } catch (err) {
            reply(`❌ *Invalid JSON:*\n${err.message}`);
        }
    },
};
