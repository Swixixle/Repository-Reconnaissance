import nodemailer from "nodemailer";

export async function sendAnomalyEmail(opts: {
  to: string;
  targetLabel: string;
  targetId: string;
  timestamp: string;
  diffSummary: string;
  receiptHash: string;
  anomalyReason: string;
  appUrl?: string;
}): Promise<void> {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.warn("[alert] SMTP_HOST not set — skipping email");
    return;
  }
  const port = Number(process.env.SMTP_PORT || "587");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@localhost";
  const linkBase = process.env.APP_URL || "http://localhost:5000";
  const body = [
    `Anomaly: ${opts.anomalyReason}`,
    "",
    opts.diffSummary,
    "",
    `Receipt hash: ${opts.receiptHash}`,
    `Time: ${opts.timestamp}`,
    "",
    `Timeline: ${linkBase}/timeline/${encodeURIComponent(opts.targetId)}`,
  ].join("\n");
  await transporter.sendMail({
    from,
    to: opts.to,
    subject: `[Debrief Alert] Anomaly detected in ${opts.targetLabel} — ${opts.timestamp}`,
    text: body,
  });
}

export async function postAnomalyWebhook(
  url: string,
  payload: {
    target_id: string;
    target_label: string;
    timestamp: string;
    anomaly_reason: string;
    diff_summary: string;
    receipt_hash: string;
  },
): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error("[alert] webhook failed", res.status, await res.text().catch(() => ""));
  }
}
