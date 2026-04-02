import { NextRequest } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchLabels } from "@/lib/github";

// GET /api/repos/[id]/labels — fetch available labels from GitHub
export async function GET(
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

  const available = await fetchLabels(repo.owner, repo.repo);

  return Response.json({ available });
}

// POST /api/repos/[id]/labels — save label subscriptions
export async function POST(
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
  const labels: string[] = body.labels || [];

  // Delete existing and recreate
  await prisma.labelSubscription.deleteMany({
    where: { trackedRepoId: id },
  });

  if (labels.length > 0) {
    await prisma.labelSubscription.createMany({
      data: labels.map((label) => ({
        trackedRepoId: id,
        label,
      })),
    });
  }

  return Response.json({ success: true, count: labels.length });
}
