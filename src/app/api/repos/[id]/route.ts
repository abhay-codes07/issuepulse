import { NextRequest } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/repos/[id] — update repo settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getOrCreateUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repo = await prisma.trackedRepo.findFirst({
    where: { id, userId: user.id },
  });

  if (!repo) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const updates: Record<string, boolean> = {};

  if (typeof body.emailEnabled === "boolean") updates.emailEnabled = body.emailEnabled;
  if (typeof body.pushEnabled === "boolean") updates.pushEnabled = body.pushEnabled;

  const updated = await prisma.trackedRepo.update({
    where: { id },
    data: updates,
  });

  return Response.json({ repo: updated });
}

// DELETE /api/repos/[id] — remove tracked repo
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getOrCreateUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repo = await prisma.trackedRepo.findFirst({
    where: { id, userId: user.id },
  });

  if (!repo) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.trackedRepo.delete({ where: { id } });

  return Response.json({ success: true });
}
