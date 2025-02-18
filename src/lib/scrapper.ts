/* eslint-disable prefer-const */
import axios from "axios";
import * as cheerio from "cheerio";

export const scrapeF1News = async (): Promise<string[]> => {
    try {
        let news: string[] = []; // ✅ Ensure it's an array

        // ✅ Scrape Formula 1 Website
        const { data: f1Data } = await axios.get("https://www.formula1.com/en/latest/all.html");
        const $f1 = cheerio.load(f1Data);
        $f1(".f1-latest-listing--grid-item a").each((_, el) => {
            const title = $f1(el).find(".f1-latest-listing--title").text().trim();
            const link = "https://www.formula1.com" + $f1(el).attr("href");
            news.push(`${title} - ${link}`); // ✅ Now works correctly
        });

        // ✅ Scrape ESPN F1 News
        const { data: espnData } = await axios.get("https://www.espn.com/f1/");
        const $espn = cheerio.load(espnData);
        $espn(".headlineStack__list a").each((_, el) => {
            const title = $espn(el).text().trim();
            const link = "https://www.espn.com" + $espn(el).attr("href");
            news.push(`${title} - ${link}`); // ✅ Now works correctly
        });

        // ✅ Remove duplicates
        const uniqueNews = [...new Set(news)];

        return uniqueNews.slice(0, 10); // ✅ Return top 10 news articles
    } catch (error) {
        console.error("F1 News Scraper Error:", error);
        return [];
    }
};
