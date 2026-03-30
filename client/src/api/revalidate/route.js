import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { tags } = await req.json();

        if (Array.isArray(tags)) {
            tags.forEach((tag) => revalidateTag(tag));
        }

        return NextResponse.json({ revalidated: true });
    } catch (err) {
        return NextResponse.json({ error: "Failed to revalidate" }, { status: 500 });
    }
}