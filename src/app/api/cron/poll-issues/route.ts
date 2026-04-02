import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchIssuesSince } from "@/lib/github";
import { sendIssueEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// GET /api/cron/poll-issues — Vercel Cron handler
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all tracked repos with their labels and users
    const trackedRepos = await prisma.trackedRepo.findMany({
      include: {
        labelSubscriptions: true,
        user: true,
      },
    });

    let totalNewIssues = 0;

    for (const repo of trackedRepos) {
      const labels = repo.labelSubscriptions.map((ls) => ls.label);
      if (labels.length === 0) continue;

      try {
        const issues = await fetchIssuesSince(
          repo.owner,
          repo.repo,
          labels,
          repo.lastChecked
        );

        if (issues.length === 0) {
          // Still update lastChecked
          await prisma.trackedRepo.update({
            where: { id: repo.id },
            data: { lastChecked: new Date() },
          });
          continue;
        }

        // Check for duplicates (issues we've already notified about)
        const existingUrls = await prisma.notification.findMany({
          where: {
            userId: repo.userId,
            issueUrl: { in: issues.map((i) => i.html_url) },
          },
          select: { issueUrl: true },
        });

        const existingUrlSet = new Set(existingUrls.map((e) => e.issueUrl));
        const newIssues = issues.filter((i) => !existingUrlSet.has(i.html_url));

        if (newIssues.length === 0) {
          await prisma.trackedRepo.update({
            where: { id: repo.id },
            data: { lastChecked: new Date() },
          });
          continue;
        }

        // Create notifications
        await prisma.notification.createMany({
          data: newIssues.map((issue) => ({
            userId: repo.userId,
            repoFullName: `${repo.owner}/${repo.repo}`,
            issueTitle: issue.title,
            issueUrl: issue.html_url,
            issueNumber: issue.number,
            labels: issue.labels,
          })),
        });

        totalNewIssues += newIssues.length;

        // Send email notifications
        if (repo.emailEnabled && repo.user.email) {
          for (const issue of newIssues) {
            await sendIssueEmail({
              to: repo.user.email,
              repoFullName: `${repo.owner}/${repo.repo}`,
              issueTitle: issue.title,
              issueUrl: issue.html_url,
              issueNumber: issue.number,
              labels: issue.labels,
            });
          }
        }

        // Send push notifications
        if (repo.pushEnabled && repo.user.pushSubscription) {
          for (const issue of newIssues) {
            await sendPushNotification(repo.user.pushSubscription, {
              title: `New issue in ${repo.owner}/${repo.repo}`,
              body: issue.title,
              url: issue.html_url,
            });
          }
        }

        // Update lastChecked
        await prisma.trackedRepo.update({
          where: { id: repo.id },
          data: { lastChecked: new Date() },
        });
      } catch (error) {
        console.error(`Error polling ${repo.owner}/${repo.repo}:`, error);
        continue;
      }
    }

    return Response.json({
      success: true,
      reposChecked: trackedRepos.length,
      newIssues: totalNewIssues,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return Response.json({ error: "Cron job failed" }, { status: 500 });
  }
}
