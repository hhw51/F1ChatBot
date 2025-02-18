import { NextResponse } from "next/server";
import { getClaudeResponse } from "@/lib/claude";
import { getLatestF1Champion } from "@/lib/scraper"; 
import { saveChatMessage, getChatHistory } from "@/lib/astra";

export async function POST(req: Request) {
    try {
        const { message, user } = await req.json();
        // ✅ Fetch Chat History (Last 5 Messages for Context)
        const chatHistory = await getChatHistory(user);
        
        // ✅ Detect if Scraping is Needed (Post-2022 Questions)
        const needsScraping = isPost2022Question(message);
        
        console.log("🤡🙏",needsScraping)
        let responseText: string ="";

        if (needsScraping) {
            console.log("🌍 Scraping Wikipedia for the latest F1 World Champion...");
            let scrapedChampion = await getLatestF1Champion(); // ✅ Call scraper

            if (scrapedChampion) {
                // ✅ Ensure a clean format (Remove `[XX]` from the scraped result)
                scrapedChampion = scrapedChampion.replace(/\[\d+\]/g, "").trim();

                responseText = `🏆 The 2024 Formula 1 World Champion is **${scrapedChampion}**! 🎉`;
                console.log(`✅ Scraped Champion: ${scrapedChampion}`);

                // ✅ DIRECTLY RETURN THE SCRAPED RESULT (NO CLAUDE FALLBACK)
                await saveChatMessage(user, message, responseText);
                return NextResponse.json({ response: responseText });
            } else {
                console.warn("❌ Scraping failed. No valid champion data found.");
            }
        }

        // ✅ If Scraping Fails, THEN Use Claude
        if (!responseText || responseText.trim() === "") { 
            console.log("🧠 Using Claude for response...");
            responseText = await getClaudeResponse(message, chatHistory);
        }

        // ✅ Save Chat History
        await saveChatMessage(user, message, responseText);

        return NextResponse.json({ response: responseText });
    } catch (error) {
        console.error("❌ Chat API Error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}

function isPost2022Question(message: string): boolean {
    const f1Keywords = [
        /current world champion/i,
        /who.*won.*(last|latest).*race/i,
        /latest f1 standings/i,
        /\b2023\b|\b2024\b|\b2025\b/i,
        /\bcurrent\b.*\b(f1|formula 1|champion|winner|standings)\b/i
    ];

    return f1Keywords.some((regex) => regex.test(message));
}
