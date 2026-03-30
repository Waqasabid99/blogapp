import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const tags = body?.tags || [];

        if (!Array.isArray(tags)) {
            return NextResponse.json(
                { error: "Tags must be an array" },
                { status: 400 }
            );
        }

        tags.forEach((tag) => revalidateTag(tag));

        return NextResponse.json({
            revalidated: true,
            tags
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Failed to revalidate" },
            { status: 500 }
        );
    }
}