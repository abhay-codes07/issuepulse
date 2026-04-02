import { NextRequest } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/web-push — save push subscription
export async function POST(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const subscription = body.subscription;

  if (!subscription) {
    return Response.json({ error: "Missing subscription" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { pushSubscription: JSON.stringify(subscription) },
  });

  return Response.json({ success: true });
}
