import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import axios from "axios";
import "dotenv/config";

console.log(process.env.ASTRA_DB_NAMESPACE);

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    CLAUDE_API_KEY, // 👈 Using Claude instead of OpenAI
} = process.env;

// Set embedding dimension (Claude does not have fixed dimensions)
const VECTOR_DIMENSION = 768; // Adjust based on testing

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const f1Data = [
    "https://en.wikipedia.org/wiki/Formula_One",
    "https://www.formula1.com/en/latest/all"
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
});

const generateClaudeEmbedding = async (text: string): Promise<number[]> => {
    try {
        console.log("Processing text for Claude:", text.slice(0, 200)); // Debug log

        const response = await axios.post(
            "https://api.anthropic.com/v1/messages",
            {
                model: "claude-3-opus-20240229",
                max_tokens: 1024, // Increased to avoid truncation
                temperature: 0,
                system: `Convert the given natural language text into a valid JSON array of exactly 768 floating-point numbers representing its semantic meaning.
                Only return the JSON array, nothing else, and ensure it is properly formatted.`,
                messages: [{ role: "user", content: text }],
            },
            {
                headers: {
                    "x-api-key": CLAUDE_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
            }
        );

        // Extract Claude's response
        let embeddingText = response.data.content[0].text.trim();
        console.log("Claude Response:", embeddingText); // Debug log

        // Ensure response starts and ends with proper JSON brackets
        if (!embeddingText.startsWith("[") || !embeddingText.endsWith("]")) {
            throw new Error("Claude returned invalid JSON. Skipping.");
        }

        // Ensure no extra characters or truncation
        embeddingText = embeddingText.replace(/\s+/g, "").trim();

        // Try parsing as JSON
        const embeddingArray = JSON.parse(embeddingText);

        // Ensure it's an array of exactly 768 numbers
        if (
            !Array.isArray(embeddingArray) ||
            embeddingArray.length !== 768 ||
            !embeddingArray.every(num => typeof num === "number")
        ) {
            throw new Error(`Invalid embedding format received from Claude. Expected 768 numbers.`);
        }

        return embeddingArray;
    } catch (error) {
        console.error("Error generating embedding with Claude:", error);
        return [];
    }
};


const createCollection = async (SimilarityMetric: SimilarityMetric = "dot_product") => {
    try {
        // Fetch existing collections
        const existingCollections = await db.listCollections();
        console.log("Existing collections:", existingCollections);

        // Check if collection already exists
        if (existingCollections.some(col => col.name === ASTRA_DB_COLLECTION)) {
            console.log(`Collection '${ASTRA_DB_COLLECTION}' already exists. Skipping creation.`);
            return;
        }

        // Create collection with adjusted dimension
        const res = await db.createCollection(ASTRA_DB_COLLECTION!, {
            vector: {
                dimension: VECTOR_DIMENSION, // ✅ Changed to match Claude embeddings
                metric: SimilarityMetric
            }
        });

        console.log(`Collection '${ASTRA_DB_COLLECTION}' created successfully.`);
        console.log(res);
    } catch (error) {
        console.error("Error creating collection:", error);
    }
};

const LoadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION!);
    for await (const url of f1Data) {
        const content = await scrapePage(url);
        if (!content) continue; // Skip if no clean text found

        const chunks = await splitter.splitText(content);
        for await (const chunk of chunks) {
            try {
                const vector = await generateClaudeEmbedding(chunk);

                // ✅ Ensure vector is valid before inserting
                if (vector.length !== 768) {
                    console.error(`Embedding size mismatch (Expected 768, got ${vector.length}). Skipping chunk.`);
                    continue;
                }

                const res = await collection.insertOne({ $vector: vector, text: chunk });
                console.log("Inserted:", res);
            } catch (error) {
                console.error("Error inserting into database:", error);
            }

            // ✅ Prevent API rate limits
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};



const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: { headless: true },
        gotoOptions: { waitUntil: "domcontentloaded" },
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => {
                return document.body.innerText // ✅ Extracts clean text instead of raw HTML
                    .replace(/\s+/g, ' ')      // ✅ Remove excessive whitespace
                    .trim();
            });
            await browser.close();
            return result;
        }
    });

    const cleanText = await loader.scrape();
    if (!cleanText || cleanText.length < 100) {
        console.warn(`Skipping URL ${url} due to insufficient text.`);
        return "";
    }
    
    return cleanText;
};


// ✅ Run the script in the correct order
(async () => {
    await createCollection(); // First, ensure the collection exists
    await LoadSampleData();   // Then, load the data
})();
