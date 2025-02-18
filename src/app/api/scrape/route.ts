import { NextResponse } from "next/server";
import { scrapeF1News } from "../../../lib/scrapper";

export async function GET() {
    const news = await scrapeF1News();
    return NextResponse.json({ news });
}
