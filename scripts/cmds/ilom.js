import axios from 'axios';
import { registerOnReply } from '../../src/utils/amazingbot.js';

const chatHistories = new Map();
const MAX_HISTORY = 20;

function getHistory(userId) {
    if (!chatHistories.has(userId)) chatHistories.set(userId, []);
    return chatHistories.get(userId);
}

function addHistory(userId, role, content) {
    const h = getHistory(userId);
    h.push({ role, content });
    if (h.length > MAX_HISTORY * 2) chatHistories.set(userId, h.slice(-MAX_HISTORY * 2));
}

async function askGemini(prompt, history = []) {
    const contents = [
        ...history.map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
        })),
        { role: 'user', parts: [{ text: prompt }] },
    ];
    const { data } = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents, generationConfig: { maxOutputTokens: 2048, temperature: 0.8 } },
        { timeout: 60000 }
    );
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
}

async function askOpenAI(prompt, history = []) {
    const messages = [
        { role: 'system', content: 'You are Ilom, a smart, friendly, slightly witty AI assistant made by Broken_vzn. Be helpful, concise, and have personality. Use emojis naturally.' },
        ...history.map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
        { role: 'user', content: prompt },
    ];
    const { data } = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        { model: 'gpt-4o-mini', messages, max_tokens: 2048, temperature: 0.8 },
        { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, timeout: 60000 }
    );
    return data.choices?.[0]?.message?.content || 'No response.';
}

async function generateImage(prompt) {
    try {
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
        const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
        return Buffer.from(data);
    } catch {
        return null;
    }
}

async function generateVideo(prompt) {
    try {
        const { data } = await axios.post(
            'https://api.pollinations.ai/video/generate',
            { prompt, model: 'fast-svd' },
            { timeout: 120000 }
        );
        return data?.url || null;
    } catch {
        return null;
    }
}

async function aiChat(prompt, history) {
    if (process.env.GEMINI_API_KEY) {
        try { return await askGemini(prompt, history); } catch {}
    }
    if (process.env.OPENAI_API_KEY) {
        try { return await askOpenAI(prompt, history); } catch {}
    }
    return '❌ No AI API keys configured. Set GEMINI_API_KEY or OPENAI_API_KEY.';
}

export default {
    config: {
        name: 'ilom',
        aliases: ['agnes', 'ai', 'ask', 'chat'],
        author: 'Broken_vzn',
        version: '2.0',
        shortDescription: 'Ilom AI — chat, generate images & videos',
        category: 'ai',
        coolDown: 3,
        role: 0,
        guide: {
            en: '{prefix}agnes <text> — chat with AI\n{prefix}agnes image <prompt> — generate image\n{prefix}agnes video <prompt> — generate video\n{prefix}agnes reset — reset conversation\n{prefix}agnes mode <chat|creative> — set mode'
        }
    },

    async onStart({ args, reply, sender, prefix, message, React }) {
        React('🤖');

        if (!args.length) {
            return reply([
                `━━━━━━━━━━━━━━━━━━━━`,
                `  🤖 *AGNES AI*`,
                `━━━━━━━━━━━━━━━━━━━━`,
                ``,
                `  💬 Chat: ${prefix}agnes <text>`,
                `  🖼️ Image: ${prefix}agnes image <prompt>`,
                `  🎬 Video: ${prefix}agnes video <prompt>`,
                `  🔄 Reset: ${prefix}agnes reset`,
                ``,
                `_Reply to any Ilom message to continue the conversation_`,
                `━━━━━━━━━━━━━━━━━━━━`,
            ].join('\n'));
        }

        const sub = args[0].toLowerCase();

        if (sub === 'reset') {
            chatHistories.delete(sender);
            return reply(`🔄 Conversation reset. Start fresh!`);
        }

        if (sub === 'mode') {
            const mode = args[1]?.toLowerCase();
            if (!['chat', 'creative'].includes(mode)) {
                return reply(`Usage: ${prefix}agnes mode <chat|creative>\n\n• *chat* — normal conversation\n• *creative* — more creative responses`);
            }
            return reply(`✅ Mode set to *${mode}*`);
        }

        if (sub === 'image') {
            const prompt = args.slice(1).join(' ');
            if (!prompt) return reply(`Provide a prompt!\nUsage: ${prefix}agnes image <prompt>`);

            React('🎨');
            await reply(`🎨 Generating image for: *${prompt}*...`);

            const img = await generateImage(prompt);
            if (img) {
                addHistory(sender, 'user', `[Image request: ${prompt}]`);
                addHistory(sender, 'assistant', `[Generated image: ${prompt}]`);
                const sent = await reply({
                    image: img,
                    caption: `🖼️ *${prompt}*\n\n_Generated by Ilom AI_`,
                });
                registerOnReply(sent.key.id, { commandName: 'agnes', author: sender, data: { mode: 'chat' } });
            } else {
                reply(`❌ Failed to generate image. Try again later.`);
            }
            return;
        }

        if (sub === 'video') {
            const prompt = args.slice(1).join(' ');
            if (!prompt) return reply(`Provide a prompt!\nUsage: ${prefix}agnes video <prompt>`);

            React('🎬');
            await reply(`🎬 Generating video for: *${prompt}*...\nThis may take a minute...`);

            const videoUrl = await generateVideo(prompt);
            if (videoUrl) {
                addHistory(sender, 'user', `[Video request: ${prompt}]`);
                addHistory(sender, 'assistant', `[Generated video: ${prompt}]`);
                await reply(`🎬 *Video Generated*\n\n${videoUrl}\n\n_Generated by Ilom AI_`);
            } else {
                reply(`❌ Video generation failed or not available. Try again later.`);
            }
            return;
        }

        // Regular chat
        const prompt = args.join(' ');
        addHistory(sender, 'user', prompt);
        const history = getHistory(sender);

        try {
            const response = await aiChat(prompt, history.slice(0, -1));
            addHistory(sender, 'assistant', response);

            const sent = await reply({
                text: `🤖 *Ilom AI*\n━━━━━━━━━━━━━━━━━━━━\n\n${response}\n\n━━━━━━━━━━━━━━━━━━━━\n_Reply to continue chatting_`,
            });
            registerOnReply(sent.key.id, { commandName: 'agnes', author: sender, data: { mode: 'chat' } });
        } catch (err) {
            reply(`❌ AI Error: ${err.message}`);
        }
    },

    onReply({ reply, sender, message, Reply }) {
        if (sender !== Reply.author) return;
        const text = message?.message?.conversation || message?.message?.extendedTextMessage?.text || '';
        if (!text) return;

        addHistory(sender, 'user', text);
        const history = getHistory(sender);

        aiChat(text, history.slice(0, -1)).then(async response => {
            addHistory(sender, 'assistant', response);
            const sent = await reply({
                text: `🤖 *Ilom AI*\n━━━━━━━━━━━━━━━━━━━━\n\n${response}\n\n━━━━━━━━━━━━━━━━━━━━\n_Reply to continue chatting_`,
            });
            registerOnReply(sent.key.id, { commandName: 'agnes', author: sender, data: { mode: 'chat' } });
        }).catch(() => {
            reply(`❌ AI Error. Try again.`);
        });
    },
};
