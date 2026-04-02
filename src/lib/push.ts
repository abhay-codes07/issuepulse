import webPush from "web-push";

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    "mailto:notifications@issuepulse.dev",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface PushPayload {
  title: string;
  body: string;
  url: string;
  icon?: string;
}

export async function sendPushNotification(
  subscription: string,
  payload: PushPayload
) {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys not configured, skipping push notification");
    return;
  }

  try {
    const sub = JSON.parse(subscription);
    await webPush.sendNotification(sub, JSON.stringify(payload));
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number })?.statusCode;
    if (statusCode === 410 || statusCode === 404) {
      console.warn("Push subscription expired or invalid");
    } else {
      console.error("Push notification failed:", error);
    }
  }
}
