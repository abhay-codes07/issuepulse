import { NextRequest } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications — list notifications
export async function GET(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl;
  const limit = parseInt(url.searchParams.get("limit") || "30", 10);
  const repoFilter = url.searchParams.get("repo");

  const where: Record<string, unknown> = { userId: user.id };
  if (repoFilter) {
    where.repoFullName = repoFilter;
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 100),
  });

  return Response.json({ notifications });
}

// PATCH /api/notifications — mark as read
export async function PATCH(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.markAll) {
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
  } else if (body.id) {
    await prisma.notification.updateMany({
      where: { id: body.id, userId: user.id },
      data: { isRead: true },
    });
  }

  return Response.json({ success: true });
}
