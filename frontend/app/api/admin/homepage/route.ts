import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });

    const hero = await prisma.homepageSection.findUnique({
      where: { sectionKey: "hero" },
    });

    const gifting = await prisma.homepageSection.findUnique({
      where: { sectionKey: "gifting" },
    });

    return NextResponse.json({
      success: true,
      settings,
      hero,
      gifting,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings, hero, gifting } = body;

    if (settings) {
      await prisma.siteSettings.upsert({
        where: { id: "singleton" },
        update: {
          announcementText: settings.announcementText,
          announcementEnabled: settings.announcementEnabled,
          codEnabled: settings.codEnabled,
          whatsappNumber: settings.whatsappNumber,
          instagramHandle: settings.instagramHandle,
          instagramUrl: settings.instagramUrl,
        },
        create: {
          id: "singleton",
          announcementText: settings.announcementText,
          announcementEnabled: settings.announcementEnabled,
          codEnabled: settings.codEnabled,
          whatsappNumber: settings.whatsappNumber,
          instagramHandle: settings.instagramHandle,
          instagramUrl: settings.instagramUrl,
        },
      });
    }

    if (hero) {
      await prisma.homepageSection.upsert({
        where: { sectionKey: "hero" },
        update: {
          title: hero.title,
          subtitle: hero.subtitle,
        },
        create: {
          sectionKey: "hero",
          title: hero.title,
          subtitle: hero.subtitle,
        },
      });
    }

    if (gifting) {
      await prisma.homepageSection.upsert({
        where: { sectionKey: "gifting" },
        update: {
          title: gifting.title,
          subtitle: gifting.subtitle,
        },
        create: {
          sectionKey: "gifting",
          title: gifting.title,
          subtitle: gifting.subtitle,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
