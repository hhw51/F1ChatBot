import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Scrape F1 data based on the user's query.
 * @param {string} query - The question asked by the user.
 * @returns {Promise<string>} - A scraped answer or null if not found.
 */
export const scrapeF1Data = async (query: string): Promise<string | null> => {
    try {
        console.log("🔍 Scraping live data for:", query);

        // ✅ Force scraping for "Who is the current world champion?"
        if (query.toLowerCase().includes("current world champion") || query.toLowerCase().includes("2024 champion")) {
            return await scrapeWorldChampion();
        }

        console.log("❌ No relevant scraping logic for:", query);
        return null;
    } catch (error) {
        console.error("❌ Scraper Error:", error);
        return null;
    }
};

/**
 * Scrapes the **current** F1 World Champion from official sources.
 */
export const scrapeWorldChampion = async (): Promise<string | null> => {
    try {
        console.log("🌍 Scraping Wikipedia for the latest F1 World Champion...");

        // ✅ Wikipedia page for past champions
        const { data } = await axios.get("https://en.wikipedia.org/wiki/List_of_Formula_One_World_Champions");
        const $ = cheerio.load(data);

        // ✅ Find the last completed championship row (2024)
        const latestRow = $("table.wikitable tbody tr").last();
        const year = latestRow.find("td").first().text().trim();
        const champion = latestRow.find("td").eq(2).text().trim();

        if (!champion || !year) {
            console.log("❌ Could not fetch world champion.");
            return null;
        }

        console.log(`🏆 Found: ${champion} (${year})`);

        return `🏆 The **Formula 1 World Champion of ${year}** is **${champion}**.`;
    } catch (error) {
        console.error("❌ Failed to scrape world champion:", error);
        return null;
    }
};