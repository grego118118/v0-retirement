/**
 * Post-calculation nurture sequence.
 *
 * Five educational emails that move a calculator lead toward Premium. Each is
 * gated by a day offset from signup and tagged so the drip cron never resends
 * one. Content is educational-first (trust before pitch); only the final email
 * makes the Premium ask.
 */

const BASE_URL = "https://www.masspension.com"

/**
 * Go-live cutoff for the nurture sequence. Only leads whose `subscribedAt` is on
 * or after this date are enrolled — this prevents back-blasting contacts who
 * existed before the sequence launched (e.g. an older subscriber who later
 * re-engages via the calculator, whose `subscribedAt` predates go-live).
 *
 * Defaults to the launch date; override with the NURTURE_START_DATE env var
 * (ISO format, e.g. "2026-07-08") if you deploy later and want a different floor.
 */
export const NURTURE_START_DATE = new Date(
  process.env.NURTURE_START_DATE || "2026-07-08T00:00:00Z"
)

function layout(bodyHtml: string, opts: { previewText?: string } = {}): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1f2937;">
    ${opts.previewText ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.previewText}</div>` : ""}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr><td style="background:#0f172a;padding:20px 28px;">
            <span style="color:#ffffff;font-size:18px;font-weight:700;">Mass Pension</span>
            <span style="color:#93c5fd;font-size:13px;"> · Massachusetts Retirement</span>
          </td></tr>
          <tr><td style="padding:28px;">${bodyHtml}</td></tr>
          <tr><td style="padding:20px 28px;border-top:1px solid #e5e7eb;">
            <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:0;">
              You're receiving this because you used the free Massachusetts pension calculator at masspension.com.
              Independent tool — not affiliated with the Commonwealth of Massachusetts or the MSRB. Estimates only.<br>
              <a href="${BASE_URL}/api/newsletter/unsubscribe?email={{email}}" style="color:#2563eb;">Unsubscribe</a> ·
              <a href="${BASE_URL}" style="color:#2563eb;">masspension.com</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="background:#2563eb;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600;">${label}</a>`
}

export interface NurtureEmail {
  /** Sequence tag stored in subscriber.preferences to prevent resends. */
  tag: string
  /** Days after signup this email becomes eligible to send. */
  dayOffset: number
  subject: string
  html: string
}

export const NURTURE_SEQUENCE: NurtureEmail[] = [
  {
    tag: "nurture-1",
    dayOffset: 1,
    subject: "How your Massachusetts COLA actually works",
    html: layout(
      `
      <h1 style="font-size:22px;color:#0f172a;margin:0 0 16px;">The COLA detail most retirees miss</h1>
      <p style="line-height:1.7;">Massachusetts applies a <strong>3% cost-of-living adjustment</strong> each year — but only to the
      <strong>first $13,000</strong> of your pension. That caps the annual increase at about <strong>$390 ($32.50/month)</strong>,
      no matter how large your pension is.</p>
      <p style="line-height:1.7;">Over a 20–30 year retirement that still compounds meaningfully, but it means your pension
      loses ground to inflation on every dollar above $13,000. Planning for that gap early is what separates a comfortable
      retirement from a tight one.</p>
      <p style="margin:24px 0;">${button(`${BASE_URL}/resources/cola`, "See how COLA affects your pension")}</p>
      `,
      { previewText: "The 3% COLA only applies to your first $13,000 — here's what that means." }
    ),
  },
  {
    tag: "nurture-2",
    dayOffset: 3,
    subject: "Option A, B or C? The survivor decision you can't undo",
    html: layout(
      `
      <h1 style="font-size:22px;color:#0f172a;margin:0 0 16px;">One choice, locked in for life</h1>
      <p style="line-height:1.7;">At retirement you choose how your pension pays out — and the decision is <strong>permanent</strong>:</p>
      <ul style="line-height:1.8;color:#374151;">
        <li><strong>Option A</strong> — the full amount, but payments stop when you die.</li>
        <li><strong>Option B</strong> — about 1% less; returns any remaining contributions to your beneficiary.</li>
        <li><strong>Option C</strong> — roughly 7–15% less, but pays your survivor 66.67% for the rest of their life.</li>
      </ul>
      <p style="line-height:1.7;">If you have a spouse, Option C can be worth hundreds of thousands over their lifetime — or an
      unnecessary reduction if they have their own strong benefits. Running the numbers both ways is the only way to know.</p>
      <p style="margin:24px 0;">${button(`${BASE_URL}/resources/options`, "Compare Options A, B & C")}</p>
      `,
      { previewText: "Your pension option is permanent — here's how to choose." }
    ),
  },
  {
    tag: "nurture-3",
    dayOffset: 6,
    subject: "The retirement “Tax Bomb” — and how to defuse it",
    html: layout(
      `
      <h1 style="font-size:22px;color:#0f172a;margin:0 0 16px;">Restored Social Security can raise your taxes</h1>
      <p style="line-height:1.7;">With WEP and GPO repealed under the Social Security Fairness Act, many Massachusetts retirees
      are seeing Social Security benefits restored. That's good news — but the added income can push more of your Social
      Security into the taxable range and even bump your bracket.</p>
      <p style="line-height:1.7;">A little sequencing — which accounts you draw from, and when you claim — can keep more of that
      money in your pocket. Our free Tax Bomb tool shows whether you're at risk.</p>
      <p style="margin:24px 0;">${button(`${BASE_URL}/tax-bomb`, "Check my Tax Bomb risk")}</p>
      `,
      { previewText: "Restored Social Security can quietly raise your tax bill." }
    ),
  },
  {
    tag: "nurture-4",
    dayOffset: 9,
    subject: "Your pension + Social Security: the full picture",
    html: layout(
      `
      <h1 style="font-size:22px;color:#0f172a;margin:0 0 16px;">Two income streams, one plan</h1>
      <p style="line-height:1.7;">Your pension is only part of the story. When you claim Social Security — anywhere from 62 to 70 —
      changes your monthly benefit by a lot, and it interacts with your pension, taxes, and healthcare costs.</p>
      <p style="line-height:1.7;">Claim too early and you lock in a smaller check for life. Wait strategically and you can add meaningful
      guaranteed income. The right answer depends on your pension, your health, and your spouse's benefits.</p>
      <p style="margin:24px 0;">${button(`${BASE_URL}/social-security`, "See your Social Security options")}</p>
      `,
      { previewText: "When you claim Social Security changes everything." }
    ),
  },
  {
    tag: "nurture-5",
    dayOffset: 13,
    subject: "Ready to see your complete retirement plan?",
    html: layout(
      `
      <h1 style="font-size:22px;color:#0f172a;margin:0 0 16px;">Put it all together</h1>
      <p style="line-height:1.7;">Over the past couple of weeks we've covered COLA, your pension options, the Tax Bomb, and Social
      Security timing. Each one moves the needle — but the real value is seeing them <strong>together</strong>, with your
      actual numbers.</p>
      <p style="line-height:1.7;">Mass Pension Premium builds your complete plan: pension + Social Security optimization,
      tax-efficient withdrawals, a year-by-year income timeline, and a professional PDF report you can keep or share with
      an advisor.</p>
      <ul style="line-height:1.8;color:#374151;">
        <li>Social Security optimization (WEP/GPO repeal)</li>
        <li>Tax-efficient withdrawal strategy</li>
        <li>Combined income timeline</li>
        <li>Downloadable PDF report</li>
      </ul>
      <p style="line-height:1.7;">Plans start at <strong>$6.99/month</strong> with a 30-day money-back guarantee.</p>
      <p style="margin:24px 0;">${button(`${BASE_URL}/pricing`, "See Premium plans")}</p>
      `,
      { previewText: "Your complete Massachusetts retirement plan, in one place." }
    ),
  },
]
