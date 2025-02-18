import { NextResponse } from "next/server";
import { getClaudeResponse } from "@/lib/claude";
import { getLatestF1Champion } from "@/lib/scraper"; 
import { saveChatMessage, getChatHistory } from "@/lib/astra";

export async function POST(req: Request) {
    try {
        const { message, user } = await req.json();

        // ✅ Detect if Scraping is Needed (Post-2022 Questions)
        const needsScraping = isPost2022Question(message);
        let responseText: string | null = null; // ✅ Ensure responseText starts as null

        // ✅ Fetch Chat History ONLY if it's a repeat request
        const needsHistory = isRepeatRequest(message);
        const chatHistory = needsHistory ? await getChatHistory(user) : [];

        if (needsScraping) {
            console.log("🌍 Scraping Wikipedia for the latest F1 World Champion...");
            let scrapedChampion = await getLatestF1Champion();

            if (scrapedChampion) {
                scrapedChampion = scrapedChampion.replace(/\[\d+\]/g, "").trim();
                console.log(`✅ Scraped Champion: ${scrapedChampion}`);

                responseText = `🏆 The 2024 Formula 1 World Champion is **${scrapedChampion}**! 🎉`;

                // ✅ Directly return the scraped result (NO Claude)
                await saveChatMessage(user, message, responseText);
                return NextResponse.json({ response: responseText });
            } else {
                console.warn("❌ Scraping failed. No valid champion data found.");
            }
        }

        // ✅ If Scraping Fails, THEN Use Claude
        if (!responseText) { 
            console.log("🧠 Using Claude for response...");
            responseText = await getClaudeResponse(message, needsHistory ? chatHistory : []);
        }

        // ✅ Save Chat History
        await saveChatMessage(user, message, responseText);
        return NextResponse.json({ response: responseText });

    } catch (error) {
        console.error("❌ Chat API Error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}

/**
 * Detect if a question requires post-2022 data.
 */
function isPost2022Question(message: string): boolean {
    const f1Keywords = [
        // 🔹 General Champion Queries
        /who.*won.*(20(2[3-5]|[3-5][0-9])).*(world championship|wc|wdc|drivers'? championship)/i,
        /who.*is.*the.*(current|latest).*world champion/i,
        /current.*(f1|formula 1|drivers'?).*champion/i,

        // 🔹 Constructors' Championship Queries
        /who.*won.*(20(2[3-5]|[3-5][0-9])).*(constructors'? championship|wcc)/i,
        /current.*(f1|formula 1|constructors'?).*champion/i,
        
        // 🔹 Race Winners & Standings
        /who.*won.*(last|latest|most recent).*race/i,
        /latest.*(race results|f1 standings|driver standings|constructor standings)/i,

        // 🔹 Specific Season References (Recent & Future)
        /\b20(2[3-5]|[3-5][0-9])\b/i,  // Matches 2023-2059 (adjust as needed)
        /season standings for 20(2[3-5]|[3-5][0-9])/i,

        // 🔹 Questions About Recent Champions
        /who.*was.*the.*champion.*(last|previous|most recent) season/i,
        /f1.*champion.*from.*(last|previous) year/i,

        // 🔹 Miscellaneous Keywords (Recent Season Context)
        /\bcurrent\b.*\b(f1|formula 1|champion|winner|standings|race results|leaderboard)\b/i
    ];

    return f1Keywords.some((regex) => regex.test(message));
}

/**
 * Detect if a question needs chat history.
 */
function isRepeatRequest(message: string): boolean {
    const repeatKeywords = [
        /say.*again/i,
        /repeat.*that/i,
        /what.*did.*you.*say/i,
        /can.*you.*rephrase/i
    ];
    return repeatKeywords.some((regex) => regex.test(message));
}
