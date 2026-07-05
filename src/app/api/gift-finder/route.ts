import { NextRequest, NextResponse } from "next/server";
import { getGiftFinderRecommendations } from "@/services/gift-finder.service";

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { description } = body;

  if (typeof description !== "string" || description.trim().length < MIN_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: `Please describe what you're looking for (at least ${MIN_LENGTH} characters).`,
      },
      { status: 400 }
    );
  }

  if (description.length > MAX_LENGTH) {
    return NextResponse.json(
      { success: false, error: `Description must be ${MAX_LENGTH} characters or fewer.` },
      { status: 400 }
    );
  }

  const result = await getGiftFinderRecommendations(description.trim());

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 503 });
  }

  return NextResponse.json({ success: true, data: { picks: result.picks } });
}