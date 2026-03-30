import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { tags } = await req.json();

    if (Array.isArray(tags)) {
      for (const tag of tags) revalidateTag(tag);
    }

    return NextResponse.json({ revalidated: true, tags: tags ?? [] });
  } catch (err) {
    return NextResponse.json(
      { revalidated: false, error: "Failed to revalidate" },
      { status: 500 },
    );
  }
}

