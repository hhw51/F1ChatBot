import axios from "axios";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

export const getClaudeResponse = async (
    message: string,
    chatHistory?: { role: string; content: string }[]
): Promise<string> => {
    try {
        if (!CLAUDE_API_KEY) {
            throw new Error("Claude API key is missing.");
        }

        // ✅ Fix role naming: "bot" → "assistant"
        const recentMessages = Array.isArray(chatHistory)
            ? chatHistory.map((msg) =>
                  msg.role === "bot" ? { role: "assistant", content: msg.content } : msg
              ).slice(-5)
            : [];

        const payload = {
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 500,
            temperature: 0.7,
            system: "You are an F1 chatbot. Provide accurate and engaging responses about Formula 1.",
            messages: [...recentMessages, { role: "user", content: message }],
        };

        const headers = {
            "x-api-key": CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        };

        console.log("Sending request to Claude:", payload); // Debugging

        const response = await axios.post("https://api.anthropic.com/v1/messages", payload, { headers });

        console.log("Claude Response:", response.data); // Debugging

        return response.data.content[0].text.trim();
    } catch (error) {
        console.error("Claude API Error:", error.response?.data || error.message);
        return "Sorry, I couldn't fetch F1 data at the moment.";
    }
};
