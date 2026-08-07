// Shared AI helper for chat personas (ilom, broken, etc.)
// Gemini → OpenAI fallback chain. Returns plain text.

import axios from 'axios';

export async function askGemini(prompt, history = [], system = '') {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('no gemini key');
    const sysParts = system ? [{ text: system }] : [];
    const contents = [
        ...(sysParts.length ? [{ role: 'user', parts: sysParts }, { role: 'model', parts: [{ text: 'Understood.' }] }] : []),
        ...history.slice(-12).map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
        })),
        { role: 'user', parts: [{ text: prompt }] },
    ];
    const { data } = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        { contents, generationConfig: { maxOutputTokens: 1024, temperature: 0.9 } },
        { timeout: 60000 }
    );
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
}

export async function askOpenAI(prompt, history = [], system = '') {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('no openai key');
    const messages = [
        ...(system ? [{ role: 'system', content: system }] : []),
        ...history.slice(-12).map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
        { role: 'user', content: prompt },
    ];
    const { data } = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        { model: 'gpt-4o-mini', messages, max_tokens: 1024, temperature: 0.9 },
        { headers: { Authorization: `Bearer ${key}` }, timeout: 60000 }
    );
    return data.choices?.[0]?.message?.content || 'No response.';
}

export async function aiChat(prompt, history = [], system = '') {
    if (process.env.GEMINI_API_KEY) {
        try { return await askGemini(prompt, history, system); } catch {}
    }
    if (process.env.OPENAI_API_KEY) {
        try { return await askOpenAI(prompt, history, system); } catch {}
    }
    // No API keys — fallback to a few canned Axon-vibe lines
    const fallbacks = [
        "I'd love to say something clever but no AI brain is plugged in yet. Drop GEMINI_API_KEY in .env and I'll actually talk.",
        "No AI keys configured, so you're getting the raw me: set GEMINI_API_KEY or OPENAI_API_KEY and I'll chat properly.",
        "Right now I'm running on default mode — wire up an AI key and I'll start being useful (and sarcastic).",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
