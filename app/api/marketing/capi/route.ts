import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, eventId, eventSourceUrl, clientUserAgent, customData } = body;

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "0.0.0.0";
    const clientIpAddress = ip.split(",")[0].trim();

    const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
    const META_DATASET_ID = process.env.META_DATASET_ID;

    if (!META_ACCESS_TOKEN || !META_DATASET_ID) {
      // Clean fallback if no credentials provided
      return NextResponse.json({ success: true, message: "CAPI skipped: missing credentials" });
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: eventSourceUrl,
          action_source: "website",
          user_data: {
            client_ip_address: clientIpAddress,
            client_user_agent: clientUserAgent,
          },
          custom_data: customData,
        },
      ],
    };

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${META_DATASET_ID}/events?access_token=${META_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("CAPI Error:", error);
    return NextResponse.json({ success: false, error: "CAPI Error" }, { status: 500 });
  }
}
