import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getSiteSettings,
  updateSiteSettings,
  ANNOUNCEMENT_BAR_MAX_LENGTH,
  MAX_HERO_IMAGES,
} from "@/services/site-settings.service";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch site settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { heroImages, announcementBar, isStoreOpen } = body;

    if (heroImages !== undefined) {
      const isValidArray =
        Array.isArray(heroImages) &&
        heroImages.every((url) => typeof url === "string" && url.trim().length > 0);

      if (!isValidArray) {
        return NextResponse.json(
          { success: false, error: "heroImages must be an array of non-empty strings" },
          { status: 400 }
        );
      }

      if (heroImages.length > MAX_HERO_IMAGES) {
        return NextResponse.json(
          { success: false, error: `A maximum of ${MAX_HERO_IMAGES} hero images is allowed` },
          { status: 400 }
        );
      }
    }

    if (announcementBar !== undefined && announcementBar !== null) {
      if (typeof announcementBar !== "string") {
        return NextResponse.json(
          { success: false, error: "announcementBar must be a string" },
          { status: 400 }
        );
      }

      if (announcementBar.length > ANNOUNCEMENT_BAR_MAX_LENGTH) {
        return NextResponse.json(
          {
            success: false,
            error: `Announcement bar must be ${ANNOUNCEMENT_BAR_MAX_LENGTH} characters or fewer`,
          },
          { status: 400 }
        );
      }
    }

    if (isStoreOpen !== undefined && typeof isStoreOpen !== "boolean") {
      return NextResponse.json(
        { success: false, error: "isStoreOpen must be a boolean" },
        { status: 400 }
      );
    }

    const updated = await updateSiteSettings({
      heroImages,
      announcementBar:
        announcementBar === undefined ? undefined : announcementBar?.trim() || null,
      isStoreOpen,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update site settings" },
      { status: 500 }
    );
  }
}