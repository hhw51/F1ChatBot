import { NextResponse } from "next/server";
import { getClaudeResponse } from "@/lib/claude";
import { saveChatMessage } from "@/lib/astra";

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();
        if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

        const response = await getClaudeResponse(message, history || []); // ✅ Ensure history is an array
        await saveChatMessage("user", message, response);

        return NextResponse.json({ response });
    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
