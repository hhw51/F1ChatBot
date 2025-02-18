import { DataAPIClient } from "@datastax/astra-db-ts";
import { v4 as uuidv4 } from "uuid";

const ASTRA_DB_APPLICATION_TOKEN = process.env.ASTRA_DB_APPLICATION_TOKEN;
const ASTRA_DB_API_ENDPOINT = process.env.ASTRA_DB_API_ENDPOINT;
const ASTRA_DB_NAMESPACE = process.env.ASTRA_DB_NAMESPACE;

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
export const db = client.db(ASTRA_DB_API_ENDPOINT!, { namespace: ASTRA_DB_NAMESPACE });

export const ensureCollectionExists = async () => {
    try {
        const collections = await db.listCollections();
        if (!collections.some(col => col.name === "f1chat_history")) {
            console.log("Creating 'f1chat_history' collection...");
            await db.createCollection("f1chat_history", {
                vector: { dimension: 768, metric: "cosine" } // Ensure it's a valid Data API Collection
            });
            console.log("Collection 'f1chat_history' created.");
        } else {
            console.log("'f1chat_history' collection already exists.");
        }
    } catch (error) {
        console.error("Error checking/creating collection:", error);
    }
};


export const ensureNewsCollectionExists = async () => {
    try {
        const collections = await db.listCollections();
        if (!collections.some(col => col.name === "f1_news")) {
            console.log("Creating 'f1_news' collection...");
            await db.createCollection("f1_news", {
                vector: { dimension: 768, metric: "cosine" } // Adjust as needed
            });
            console.log("Collection 'f1_news' created.");
        }
    } catch (error) {
        console.error("Error checking/creating collection:", error);
    }
};

export const saveF1News = async (news: { title: string; summary: string; link: string }[]) => {
    try {
        await ensureNewsCollectionExists();
        const collection = await db.collection("f1_news");

        for (const article of news) {
            const id = uuidv4(); // ✅ Generate a unique ID
            await collection.insertOne({
                id,
                title: article.title,
                summary: article.summary,
                link: article.link,
                timestamp: new Date().toISOString(),
            });
        }

        console.log("F1 News saved to AstraDB.");
    } catch (error) {
        console.error("Error saving F1 news:", error);
    }
};

export const getLatestF1News = async () => {
    try {
        await ensureNewsCollectionExists();
        const collection = await db.collection("f1_news");

        const news = await collection.find({}, { sort: { timestamp: -1 }, limit: 10 });

        return news;
    } catch (error) {
        console.error("Error fetching F1 news:", error);
        return [];
    }
};

export const ensureChatCollectionExists = async () => {
    try {
        const collections = await db.listCollections();
        if (!collections.some(col => col.name === "f1chat_history")) {
            console.log("Creating 'f1chat_history' collection...");
            await db.createCollection("f1chat_history", {
                vector: { dimension: 768, metric: "cosine" }
            });
            console.log("✅ Collection 'f1chat_history' created.");
        }
    } catch (error) {
        console.error("❌ Error checking/creating collection:", error);
    }
};

/**
 * Save a chat message to AstraDB
 */
export const saveChatMessage = async (user: string, message: string, response: string) => {
    try {
        await ensureChatCollectionExists();
        const collection = await db.collection("f1chat_history");

        const id = uuidv4();
        await collection.insertOne({
            id,
            user,
            message,
            response,
            timestamp: new Date().toISOString(),
        });

        console.log("💾 Chat message saved to AstraDB.");
    } catch (error) {
        console.error("❌ Error saving chat message:", error);
    }
};

/**
 * Retrieve the last 5 messages for context
 */
export const getChatHistory = async (user: string) => {
    try {
        await ensureChatCollectionExists();
        const collection = await db.collection("f1chat_history");

        // ✅ Convert cursor to an array
        const cursor = collection.find({ user }, { sort: { timestamp: -1 }, limit: 5 });
        const chatHistory = await cursor.toArray(); // Fix: Convert cursor to array

        console.log("📜 Retrieved chat history:", chatHistory);
        return chatHistory.map(entry => ({ role: "user", content: entry.message }));
    } catch (error) {
        console.error("❌ Error fetching chat history:", error);
        return [];
    }
};
