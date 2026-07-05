import { prisma } from "@/lib/prisma";
import { getOrSetCache } from "@/lib/redis";

const SITE_SETTINGS_ID = "default";
const SITE_SETTINGS_CACHE_KEY = "site-settings";
const SITE_SETTINGS_CACHE_TTL = 300; // 5 minutes

export const ANNOUNCEMENT_BAR_MAX_LENGTH = 150;
export const MAX_HERO_IMAGES = 4;

export interface SiteSettingsData {
  heroImages: string[];
  announcementBar: string | null;
  isStoreOpen: boolean;
}

export interface UpdateSiteSettingsInput {
  heroImages?: string[];
  announcementBar?: string | null;
  isStoreOpen?: boolean;
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  return getOrSetCache(SITE_SETTINGS_CACHE_KEY, SITE_SETTINGS_CACHE_TTL, async () => {
    try {
      const settings = await prisma.siteSettings.findFirst();
      return {
        announcementBar: settings?.announcementBar ?? null,
        isStoreOpen: settings?.isStoreOpen ?? true,
        heroImages: settings?.heroImages ?? [],
      };
    } catch {
      return { announcementBar: null, isStoreOpen: true, heroImages: [] };
    }
  });
}

export async function updateSiteSettings(
  input: UpdateSiteSettingsInput
): Promise<SiteSettingsData> {
  const data: {
    heroImages?: string[];
    announcementBar?: string | null;
    isStoreOpen?: boolean;
  } = {};

  if (input.heroImages !== undefined) data.heroImages = input.heroImages;
  if (input.announcementBar !== undefined) data.announcementBar = input.announcementBar;
  if (input.isStoreOpen !== undefined) data.isStoreOpen = input.isStoreOpen;

  const updated = await prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    update: data,
    create: {
      id: SITE_SETTINGS_ID,
      heroImages: input.heroImages ?? [],
      announcementBar: input.announcementBar ?? null,
      isStoreOpen: input.isStoreOpen ?? true,
    },
  });

  return {
    heroImages: updated.heroImages,
    announcementBar: updated.announcementBar,
    isStoreOpen: updated.isStoreOpen,
  };
}