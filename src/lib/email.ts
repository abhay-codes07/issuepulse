import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailNotification {
  to: string;
  repoFullName: string;
  issueTitle: string;
  issueUrl: string;
  issueNumber: number;
  labels: string[];
}

export async function sendIssueEmail(notification: EmailNotification) {
  const { to, repoFullName, issueTitle, issueUrl, issueNumber, labels } = notification;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "IssuePulse <onboarding@resend.dev>",
      to,
      subject: `🔔 New issue in ${repoFullName}: ${issueTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#0F1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
            <div style="text-align:center;margin-bottom:32px;">
              <h1 style="color:#6366F1;font-size:28px;margin:0;">
                ⚡ IssuePulse
              </h1>
            </div>
            <div style="background-color:#1A1D2E;border-radius:12px;padding:32px;border:1px solid rgba(99,102,241,0.2);">
              <p style="color:#94A3B8;font-size:14px;margin:0 0 8px 0;">
                📦 ${repoFullName} · #${issueNumber}
              </p>
              <h2 style="color:#F8FAFC;font-size:20px;margin:0 0 16px 0;line-height:1.4;">
                ${issueTitle}
              </h2>
              <div style="margin-bottom:24px;">
                ${labels.map((l) => `<span style="display:inline-block;background-color:rgba(99,102,241,0.2);color:#A5B4FC;padding:4px 12px;border-radius:20px;font-size:12px;margin:0 4px 4px 0;">${l}</span>`).join("")}
              </div>
              <a href="${issueUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">
                View Issue on GitHub →
              </a>
            </div>
            <p style="color:#475569;font-size:12px;text-align:center;margin-top:24px;">
              You're receiving this because you track ${repoFullName} on IssuePulse.
            </p>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
