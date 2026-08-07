import { getEco, saveEco, fmtCoins } from '../../src/utils/economyDB.js';

// Crafting recipes using shop items as ingredients
const RECIPES = {
    'fishingrod': {
        name: 'Fishing Rod', price: 500,
        craft: { wood: 2 }, materials: '2 wood',
    },
    'gun': {
        name: 'Gun', price: 800,
        craft: { metal: 2, wood: 1 }, materials: '2 metal + 1 wood',
    },
    'pickaxe': {
        name: 'Pickaxe', price: 600,
        craft: { metal: 2 }, materials: '2 metal',
    },
    'shield': {
        name: 'Shield', price: 400,
        craft: { metal: 1, wood: 1 }, materials: '1 metal + 1 wood',
    },
    'laptop': {
        name: 'Laptop', price: 1500,
        craft: { metal: 3 }, materials: '3 metal',
    },
    'luckycharm': {
        name: 'Lucky Charm', price: 1200,
        craft: { metal: 1, crystal: 1 }, materials: '1 metal + 1 crystal',
    },
};

const MATERIALS = ['wood', 'metal', 'crystal'];

export default {
    config: {
        name: 'craft',
        aliases: ['craftitem', 'crafting'],
        author: 'Broken_vzn',
        version: '1.0',
        shortDescription: 'Craft items from gathered materials',
        category: 'economy',
        coolDown: 3,
        role: 0,
        guide: { en: '{prefix}craft — list recipes\n{prefix}craft <item> — craft it\n{prefix}craft <material> — gather materials\n{prefix}craft bag — view your materials' },
    },
    async onStart({ args, sender, reply, React }) {
        React('🛠️');
        const sub = (args[0] || '').toLowerCase();

        // Gather materials
        if (MATERIALS.includes(sub)) {
            return gather(sub, sender, reply);
        }

        // View material bag
        if (sub === 'bag' || sub === 'materials') {
            const eco = getEco(sender);
            const mats = eco.materials || {};
            let text = `🧰 *Material Bag*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
            MATERIALS.forEach(m => { text += `  • ${m}: *${mats[m] || 0}*\n`; });
            text += `\n_Gather: .craft wood | .craft metal | .craft crystal_\n_Smelt metal & crystal with .craft smelt_`;
            text += `\n━━━━━━━━━━━━━━━━━━━━`;
            return reply(text);
        }

        // Smelt: convert wood to metal/crystal chance
        if (sub === 'smelt') {
            const eco = getEco(sender);
            const mats = eco.materials || {};
            if ((mats.wood || 0) < 5) return reply(`❌ You need 5 wood to smelt. You have ${mats.wood || 0}.`);
            const mats2 = { ...mats, wood: (mats.wood || 0) - 5 };
            const roll = Math.random();
            if (roll < 0.6) {
                mats2.metal = (mats2.metal || 0) + 1;
                saveEco(sender, { materials: mats2 });
                return reply(`🔥 Smelted 5 wood → *1 metal*!\nMetal: ${mats2.metal}`);
            } else {
                mats2.crystal = (mats2.crystal || 0) + 1;
                saveEco(sender, { materials: mats2 });
                return reply(`💎 Smelted 5 wood → *1 crystal*!\nCrystal: ${mats2.crystal}`);
            }
        }

        // List recipes
        if (!sub || sub === 'list' || sub === 'help') {
            let text = `🛠️ *Crafting Recipes*\n━━━━━━━━━━━━━━━━━━━━\n\n`;
            Object.entries(RECIPES).forEach(([id, r]) => {
                text += `  ${r.name} (${id})\n`;
                text += `  └ Needs: ${r.materials}\n`;
                text += `  └ Worth: ${fmtCoins(r.price)}\n\n`;
            });
            text += `━━━━━━━━━━━━━━━━━━━━\n`;
            text += `Gather materials:\n  .craft wood / metal / crystal\n  .craft smelt (wood → metal/crystal)\n  .craft bag (view materials)\n  .craft <item id> (craft it)`;
            return reply(text);
        }

        // Craft an item
        const recipe = RECIPES[sub];
        if (!recipe) return reply(`Unknown recipe: "${sub}". Use .craft to see available recipes.`);

        const eco = getEco(sender);
        const mats = eco.materials || {};

        // Check materials
        for (const [mat, need] of Object.entries(recipe.craft)) {
            if ((mats[mat] || 0) < need) {
                return reply(`❌ You need *${need} ${mat}* to craft ${recipe.name}. You have ${mats[mat] || 0}.\n\nGather more with .craft ${mat}`);
            }
        }

        // Deduct materials
        const mats2 = { ...mats };
        for (const [mat, need] of Object.entries(recipe.craft)) {
            mats2[mat] -= need;
        }

        // Add item to inventory
        const inv = eco.inventory || [];
        inv.push(sub);

        saveEco(sender, { materials: mats2, inventory: inv });

        reply(`🛠️ *Crafted: ${recipe.name}!*\n\n✅ Added to inventory\n🧰 Materials left: ${MATERIALS.map(m => `${m}:${mats2[m] || 0}`).join(', ')}\n\n_Check with .inventory_`);
    },
};

function gather(material, sender, reply) {
    const eco = getEco(sender);
    const mats = eco.materials || {};

    // Success chance
    const success = Math.random() < 0.7;
    let gained = 0;
    if (success) {
        gained = material === 'wood' ? 2 : 1;
        if (Math.random() < 0.1) gained++; // bonus
    }

    if (gained > 0) {
        mats[material] = (mats[material] || 0) + gained;
        saveEco(sender, { materials: mats });
    }

    const emotes = { wood: '🪵', metal: '🔩', crystal: '💎' };
    reply(`${emotes[material] || '🧱'} *Gathering ${material}...*\n\n${gained > 0 ? `✅ Found *${gained} ${material}*!` : '❌ Nothing found this time.'}\n\n🧰 ${material}: *${mats[material] || 0}*`);
}
