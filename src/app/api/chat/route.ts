import { NextResponse } from "next/server";
import { getClaudeResponse } from "@/lib/claude";
import { scrapeWorldChampion } from "@/lib/scraper";
import { saveChatMessage, getChatHistory } from "@/lib/astra";

export async function POST(req: Request) {
    try {
        const { message, user } = await req.json();

        // ✅ Fetch Chat History (Last 5 Messages for Context)
        const chatHistory = await getChatHistory(user);

        // ✅ Force Web Scraping for 2024 Champion Queries
        if (message.toLowerCase().includes("current world champion") || message.includes("2024")) {
            console.log("🌍 Using Web Scraping for latest F1 World Champion...");
            const scrapedChampion = await scrapeWorldChampion();
            if (scrapedChampion) {
                await saveChatMessage(user, message, scrapedChampion);
                return NextResponse.json({ response: scrapedChampion });
            }
        }

        // ✅ If Scraping Fails, Use Claude as Fallback
        console.log("🧠 Using Claude for response...");
        const responseText = await getClaudeResponse(message, chatHistory);

        // ✅ Save Chat History
        await saveChatMessage(user, message, responseText);

        return NextResponse.json({ response: responseText });
    } catch (error) {
        console.error("❌ Chat API Error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
