import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
});

export async function verifyRepo(owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return {
      exists: true,
      fullName: data.full_name,
      avatarUrl: data.owner?.avatar_url ?? null,
      description: data.description,
    };
  } catch {
    return { exists: false, fullName: null, avatarUrl: null, description: null };
  }
}

export async function fetchLabels(owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.issues.listLabelsForRepo({
      owner,
      repo,
      per_page: 100,
    });
    return data.map((l) => ({ name: l.name, color: l.color }));
  } catch {
    return [];
  }
}

export async function fetchIssuesSince(
  owner: string,
  repo: string,
  labels: string[],
  since: Date
) {
  const allIssues: Array<{
    number: number;
    title: string;
    html_url: string;
    labels: string[];
    created_at: string;
  }> = [];

  for (const label of labels) {
    try {
      const { data } = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: "open",
        labels: label,
        since: since.toISOString(),
        per_page: 30,
        sort: "created",
        direction: "desc",
      });

      for (const issue of data) {
        if (issue.pull_request) continue;
        const existing = allIssues.find((i) => i.number === issue.number);
        if (!existing) {
          allIssues.push({
            number: issue.number,
            title: issue.title,
            html_url: issue.html_url,
            labels: (issue.labels as Array<{ name?: string }>)
              .map((l) => l.name ?? "")
              .filter(Boolean),
            created_at: issue.created_at,
          });
        }
      }
    } catch (error: unknown) {
      const status = (error as { status?: number })?.status;
      if (status === 403 || status === 429) {
        console.warn(`Rate limited for ${owner}/${repo}, skipping label: ${label}`);
        continue;
      }
      throw error;
    }
  }

  return allIssues;
}
