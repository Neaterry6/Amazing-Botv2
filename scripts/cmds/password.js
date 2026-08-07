export default {
    config: {
        name: 'password',
        aliases: ['passgen', 'genpass'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Generate a secure password',
        category: 'utility',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}password [length]' },
    },

    async onStart({ args, reply, prefix, React }) {
        React('🔑');

        const length = Math.min(Math.max(parseInt(args[0]) || 16, 6), 64);
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';

        for (let i = 0; i < length; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }

        reply([
            `━━━━━━━━━━━━━━━━━━━━`,
            `  🔑 *PASSWORD GENERATOR*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            ``,
            `  📏 Length: ${length}`,
            `  🔐 Password: \`${password}\``,
            ``,
            `  ⚠️ Save this somewhere safe!`,
            `━━━━━━━━━━━━━━━━━━━━`,
        ].join('\n'));
    },
};
