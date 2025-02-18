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

export const saveChatMessage = async (user: string, message: string, response: string) => {
    try {
        await ensureCollectionExists();
        const collection = await db.collection("f1chat_history");

        const id = uuidv4(); // Generate a unique ID

        await collection.insertOne({
            id, // Primary key
            user,
            message,
            response,
            timestamp: new Date().toISOString(),
        });

        console.log("Message saved to AstraDB.");
    } catch (error) {
        console.error("Error saving chat history:", error);
    }
};
