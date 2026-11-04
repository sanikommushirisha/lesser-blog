import { createHash } from "crypto";
import { promises as dns } from "dns";
import type { Express, Request, Response } from "express";
import { z } from "zod";
import { LEAD_MAGNETS, LEAD_MAGNET_IDS } from "@shared/lead-magnets";
import { TOOL_IDS, computeResult, resultEmail, type ToolAnswers, type ToolId } from "@shared/tool-results";

/**
 * Blog email gate signup: adds the reader to the newsletter list in Resend and
 * emails them what they asked for. /subscribe sends a lead magnet PDF (the gate
 * on articles). /tool-result sends the result of a free web tool, which readers
 * only get by email.
 *
 * Needs on the server:
 *   RESEND_API_KEY              Resend key that can write contacts and send
 *   RESEND_NEWSLETTER_SEGMENT_ID  the Resend segment that holds subscribers
 *   NEWSLETTER_FROM             e.g. Lesser Tax <news@news.lesser.tax>
 * Without them the route answers 503 and the gate lets the reader through.
 */

const SITE_URL = "https://lesser.tax";
const RESEND_API = process.env.RESEND_API_URL || "https://api.resend.com";

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  offer: z.enum(LEAD_MAGNET_IDS),
  // The post or tool the signup came from.
  slug: z.string().regex(/^[a-z0-9-]{1,120}$/),
  // Honeypot: hidden from people, filled in by form bots.
  company: z.string().max(200).optional(),
});

const count = z.coerce.number().finite().min(0).max(100_000_000_000);
const days = z.coerce.number().finite().min(0).max(366);
const optional = (n: z.ZodTypeAny) =>
  z.preprocess((v) => (v === "" || v === undefined ? 0 : v), n);

// Only fixed choices and bounded numbers get in. Neither reaches the logs.
const answerSchemas: Record<ToolId, z.ZodTypeAny> = {
  "rsu-gap": z.object({
    filing: z.enum(["single", "joint"]),
    rsu: count,
    salary: optional(count),
    bracket: z.coerce.number().refine((b) => [0.22, 0.24, 0.32, 0.35, 0.37].includes(b)),
  }),
  "residency-test": z.object({
    greencard: z.enum(["yes", "no"]),
    visa: z.enum(["other", "exempt"]),
    current: days,
    prior: days,
    before: days,
  }),
  "india-money": z.object({
    usperson: z.enum(["yes", "no"]),
    source: z.enum(["family", "person", "estate", "loan", "company", "trust"]),
    amount: count,
  }),
  "401k-exit": z.object({
    balance: count,
    age: z.enum(["under", "over"]),
    timing: z.enum(["before", "after"]),
    other: optional(count),
  }),
  "founder-forms": z.object({
    entity: z.enum(["smllc", "mmllc", "scorp", "ccorp"]),
    owner: z.enum(["us", "foreign"]),
  }),
};

const toolResultSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  tool: z.enum(TOOL_IDS),
  answers: z.record(z.string(), z.unknown()),
  company: z.string().max(200).optional(),
});

// Each signup sends a real email, so cap per address and in total.
const PER_IP_LIMIT = 10;
const GLOBAL_HOURLY_LIMIT = 300;
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function overLimit(key: string, limit: number): boolean {
  const now = Date.now();
  if (hits.size > 10_000) {
    hits.forEach((entry, entryKey) => {
      if (entry.resetAt <= now) hits.delete(entryKey);
    });
  }
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

/** False only when DNS says the domain cannot receive mail; lookup trouble passes. */
async function domainTakesMail(email: string): Promise<boolean> {
  try {
    const records = await dns.resolveMx(email.slice(email.lastIndexOf("@") + 1));
    return records.length > 0;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    return code !== "ENOTFOUND" && code !== "ENODATA";
  }
}

async function resend(path: string, body: unknown, headers: Record<string, string> = {}) {
  return fetch(`${RESEND_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(6000),
  });
}

function guideEmail(title: string, url: string) {
  const footer =
    "You got this because you asked for it on lesser.tax. To stop our emails, reply with the word unsubscribe.";
  const address = "Lesser Inc., 353 King St, San Francisco, CA 94158, USA";
  return {
    subject: `Your ${title}`,
    text: `Here is your ${title}: ${url}\n\nWe will also send you a short tax note for immigrants in tech each week.\n\nEducational only. Not tax or legal advice.\n\nLesser Tax\n${footer}\n${address}`,
    html: `<div style="font-family:Arial,sans-serif;color:#1a1a1a;font-size:16px;line-height:1.5;max-width:520px">
<p>Here is your ${title}.</p>
<p><a href="${url}" style="display:inline-block;background:#034f46;color:#ffffff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">Download the PDF</a></p>
<p>We will also send you a short tax note for immigrants in tech each week.</p>
<p style="font-size:13px;color:#555">Educational only. Not tax or legal advice.</p>
<p>Lesser Tax</p>
<p style="font-size:12px;color:#777">${footer}<br>${address}</p>
</div>`,
  };
}

/** Runs the checks every signup shares. Answers the request itself and returns false if one fails. */
async function passesChecks(req: Request, res: Response, email: string): Promise<boolean> {
  const { RESEND_API_KEY, RESEND_NEWSLETTER_SEGMENT_ID, NEWSLETTER_FROM } = process.env;
  if (!RESEND_API_KEY || !RESEND_NEWSLETTER_SEGMENT_ID || !NEWSLETTER_FROM) {
    res.status(503).json({ error: "Newsletter is not configured." });
    return false;
  }
  if (overLimit(`ip:${req.ip}`, PER_IP_LIMIT) || overLimit("all", GLOBAL_HOURLY_LIMIT)) {
    res.status(429).json({ error: "Too many tries. Please try again later." });
    return false;
  }
  if (!(await domainTakesMail(email))) {
    res.status(400).json({ error: "That email domain cannot receive mail. Check for a typo." });
    return false;
  }
  return true;
}

/** Adds the reader to the newsletter list, then sends the email. */
async function subscribeAndSend(
  res: Response,
  email: string,
  source: string,
  message: { subject: string; text: string; html: string },
  idempotencyKey: string,
) {
  try {
    const contact = await resend("/contacts", {
      email,
      segments: [{ id: process.env.RESEND_NEWSLETTER_SEGMENT_ID }],
    });
    // A returning reader may already be a contact; they still get the email.
    if (!contact.ok && contact.status !== 409) {
      console.error(`[newsletter] contact write failed (${contact.status}) from ${source}`);
    }

    const sent = await resend(
      "/emails",
      { from: process.env.NEWSLETTER_FROM, to: email, ...message },
      { "Idempotency-Key": idempotencyKey },
    );
    if (!sent.ok) {
      console.error(`[newsletter] email failed (${sent.status}) from ${source}`);
      res.status(502).json({ error: "We could not send the email." });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] Resend request failed:", err);
    res.status(502).json({ error: "We could not send the email." });
  }
}

export function registerNewsletterRoutes(app: Express) {
  // nginx is the one proxy in front of this server; needed for a real req.ip.
  app.set("trust proxy", 1);

  app.post("/api/newsletter/subscribe", async (req: Request, res: Response) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Enter a valid email address." });
      return;
    }
    const { email, offer, slug, company } = parsed.data;

    // Bots get a normal answer and nothing happens.
    if (company) {
      res.json({ ok: true });
      return;
    }

    if (!(await passesChecks(req, res, email))) return;

    const magnet = LEAD_MAGNETS[offer];
    const url = `${SITE_URL}/blog/guides/${magnet.file}`;
    await subscribeAndSend(res, email, `post ${slug}`, guideEmail(magnet.title, url), `gate-${offer}-${email}`.slice(0, 256));
  });

  app.post("/api/newsletter/tool-result", async (req: Request, res: Response) => {
    const parsed = toolResultSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Enter a valid email address." });
      return;
    }
    const { email, tool, company } = parsed.data;
    const answers = answerSchemas[tool].safeParse(parsed.data.answers);
    if (!answers.success) {
      res.status(400).json({ error: "Check your answers and try again." });
      return;
    }

    // Bots get a normal answer and nothing happens.
    if (company) {
      res.json({ ok: true });
      return;
    }

    if (!(await passesChecks(req, res, email))) return;

    const message = resultEmail(tool, computeResult(tool, answers.data as ToolAnswers[typeof tool]));
    // New answers are a new email, and a double click is not.
    const key = createHash("sha256").update(JSON.stringify([email, tool, answers.data])).digest("hex");
    await subscribeAndSend(res, email, `tool ${tool}`, message, `tool-${key}`);
  });
}
