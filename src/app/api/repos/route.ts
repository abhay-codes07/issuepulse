import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { verifyRepo } from "@/lib/github";

// GET /api/repos — list tracked repos for current user
export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repos = await prisma.trackedRepo.findMany({
    where: { userId: user.id },
    include: { labelSubscriptions: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({
    repos: repos.map((r) => ({
      id: r.id,
      owner: r.owner,
      repo: r.repo,
      avatarUrl: r.avatarUrl,
      emailEnabled: r.emailEnabled,
      pushEnabled: r.pushEnabled,
      lastChecked: r.lastChecked,
      labelSubscriptions: r.labelSubscriptions.map((ls) => ({
        label: ls.label,
        color: ls.color,
      })),
    })),
  });
}

// POST /api/repos — add a new tracked repo
export async function POST(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const repoStr = (body.repo as string || "").trim();

  const parts = repoStr.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return Response.json(
      { error: "Invalid format. Use owner/repo" },
      { status: 400 }
    );
  }

  const [owner, repo] = parts;

  // Check if already tracked
  const existing = await prisma.trackedRepo.findUnique({
    where: { userId_owner_repo: { userId: user.id, owner, repo } },
  });

  if (existing) {
    return Response.json(
      { error: "You're already tracking this repository" },
      { status: 409 }
    );
  }

  // Verify repo exists on GitHub
  const verification = await verifyRepo(owner, repo);
  if (!verification.exists) {
    return Response.json(
      { error: "Repository not found on GitHub" },
      { status: 404 }
    );
  }

  // Create tracked repo with default labels
  const trackedRepo = await prisma.trackedRepo.create({
    data: {
      userId: user.id,
      owner,
      repo,
      avatarUrl: verification.avatarUrl,
      labelSubscriptions: {
        create: [
          { label: "good first issue" },
          { label: "help wanted" },
          { label: "bug" },
        ],
      },
    },
  });

  return Response.json({
    repo: {
      id: trackedRepo.id,
      fullName: `${owner}/${repo}`,
      avatarUrl: verification.avatarUrl,
      description: verification.description,
    },
  });
}
