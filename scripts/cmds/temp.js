export default {
    config: {
        name: 'temp',
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Convert temperature',
        category: 'utility',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}temp <args>' },
    },
    async onStart({ args, reply, prefix, sender, from, message, React }) {
        React('⚡');
        const val = parseFloat(args[0]); const unit = args[1]?.toUpperCase(); if(!val||!unit) return reply('Usage: .temp <value> <C|F>'); if(unit==='C') reply(`${val}°C = ${((val*9/5)+32).toFixed(1)}°F`); else if(unit==='F') reply(`${val}°F = ${((val-32)*5/9).toFixed(1)}°C`); else reply('Use C or F');
    },
};
