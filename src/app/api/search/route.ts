import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/services/product.service";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() || "";

  if (q.length < 2) {
    return NextResponse.json({ results: [], total: 0 });
  }

  try {
    const { data, meta } = await getProducts({
      filters: { search: q },
      limit: 6,
    });

    const results = data.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.images[0] || null,
      categoryName: p.category?.name || null,
    }));

    return NextResponse.json({ results, total: meta.total });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [], total: 0 }, { status: 500 });
  }
}