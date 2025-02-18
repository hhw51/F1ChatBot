import axios from "axios";
import * as cheerio from "cheerio";

const WIKI_URL = "https://en.wikipedia.org/wiki/List_of_Formula_One_World_Drivers%27_Champions";

export const getLatestF1Champion = async (): Promise<string | null> => {
    try {
        console.log("🌍 Scraping Wikipedia for the latest F1 World Champion...");
        
        const { data } = await axios.get(WIKI_URL);
        const $ = cheerio.load(data);
        
        let latestChampion = null;
        
        $("table.wikitable tbody tr").each((_, row) => {
            const columns = $(row).find("td");
            if (columns.length > 0) {
                const year = $(columns[0]).text().trim();
                const driver = $(columns[1]).text().trim();
                
                if (year === "2024") {
                    latestChampion = driver;
                    return false; // Stop loop once 2024 is found
                }
            }
        });
        
        if (!latestChampion) {
            console.error("❌ Could not fetch world champion.");
            return null;
        }

        console.log("✅ Scraped Champion:", latestChampion);
        return latestChampion;
    } catch (error) {
        console.error("❌ Error scraping Wikipedia:", error);
        return null;
    }
};


(async () => {
    const result = await getLatestF1Champion();
    console.log("✅ Scraped Champion:", result);
})();
