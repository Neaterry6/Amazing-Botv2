import axios from 'axios';

export default {
    config: {
        name: 'color',
        aliases: ['colour', 'hex', 'rgb'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Show color info',
        category: 'utility',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}color <hex|#rrggbb>' },
    },

    async onStart({ args, reply, prefix, React }) {
        React('🎨');
        if (!args.length) return reply(`Usage: ${prefix}color <hex>\nExample: ${prefix}color #FF5733`);

        const color = args[0].replace('#', '');
        if (!/^[0-9a-fA-F]{6}$/.test(color)) return reply(`Invalid hex color. Example: ${prefix}color #FF5733`);

        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);

        const hue = (() => {
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            if (max === min) return 0;
            const d = max - min;
            if (max === r) return ((g - b) / d + (g < b ? 6 : 0)) * 60;
            if (max === g) return ((b - r) / d + 2) * 60;
            return ((r - g) / d + 4) * 60;
        })();

        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const textColor = brightness > 128 ? 'Black' : 'White';

        reply([
            `━━━━━━━━━━━━━━━━━━━━`,
            `  🎨 *COLOR INFO*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            ``,
            `  ■ ■ ■ ■ ■ ■ ■`,
            ``,
            `  Hex: #${color.toUpperCase()}`,
            `  RGB: ${r}, ${g}, ${b}`,
            `  HSL: ${Math.round(hue)}°, ${Math.round(((Math.max(r, g, b) - Math.min(r, g, b)) / 255) * 100)}%, ${Math.round(brightness)}%`,
            `  Brightness: ${Math.round(brightness)}%`,
            `  Text color: ${textColor}`,
            ``,
            `━━━━━━━━━━━━━━━━━━━━`,
        ].join('\n'));
    },
};
