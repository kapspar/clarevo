# Clarevo — Running To-Do List

[#clarevo--running-to-do-list](#clarevo--running-to-do-list)
> Update this file as things get done or added. Open it at the start of every session.
> Status: ✅ Done · 🔨 In Progress · 🔲 Not Started · ⏸ Parked

---

## 🧭 Context (read this first, especially in a new chat)

- **What Clarevo is:** A diagnostic, not a vault. We identify gaps in a family's financial/legal readiness and route to partners (Willful, Wealthsimple, insurers, estate lawyers) — we don't compete with them by storing documents long-term as the core value prop.
- **The business bet:** Product quality is table stakes. The thing that makes or breaks this is closing one real distribution partnership (Willful or Wealthsimple). Paid social (Meta) economics don't work at $79/year in this vertical — B2B/employer and partner channels are where the math works.
- **Don't compete with partners:** Never build toward the wills market. Position as "before and after the will" (Turbo Tax / H&R Block analogy).
- **Current focus:** Willful outreach is the highest-leverage next action (see G2 below — reconcile with old "parked" status, see note).
- **Stack at a glance:** Static HTML/CSS/JS on GitHub Pages, Supabase backend (profiles/assessments/legal_documents tables + private documents bucket), PostHog analytics (free tier, live on all 12 pages), jsPDF for binder generation.
- **Cost discipline:** Default to free/low-cost tools until there's real traction. Test with real users before infra upgrades (e.g. PWA is parked, see F6).

---

## 🔥 Next Up — High Priority

[#-next-up--high-priority](#-next-up--high-priority)

| #  | Task                                       | Notes                                                                                                                        |
| --- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| P1 | Wire assessment_completed event           | Call `window.clarevo_trackAssessmentComplete(score, province)` in `form.html` when assessment saves to Supabase              |
| P2 | Custom SMTP — send from hello@clarevo.ca | Use Resend (free up to 3,000 emails/mo). Set up in Supabase → Authentication → SMTP Settings. Do before opening to strangers |
| P3 | Lead data capture for partner referrals — `partner_clicks` table | New Supabase table: user_id, partner, gap_category, province, timestamp. (Same task as T1 below — tracked once here, removed from Technical section) |
| P4 | PIPEDA consent                             | Add third-party data sharing consent to assessment flow and privacy page before any lead selling                             |
| P5 | `learn-when-someone-dies.html` tone pass   | Soften CTA at bottom — "Get Your Free Readiness Score" is wrong tone for a grief article                                     |
| P6 | G1 — Boots on ground leave-behind PDF      | One-page printable: probate fee table, death checklist, QR code to clarevo.ca. Needed before retirement home visits          |

---

## 📋 Product / Feature

[#-product--feature](#-product--feature)

| #  | Task                              | Notes                                                                    |
| --- | ---------------------------------- | ------------------------------------------------------------------------ |
| F1 | PDF binder — enforce 1 free limit | Add `pdf_generation_count` check in dashboard. Free = 1, Pro = unlimited |
| F2 | Physical printed binder           | Research print-on-demand (Printful, Lulu, local). Target $49–79          |
| F3 | Role pages — POA depth page       | Same structure as executor page. POA is next                             |
| F4 | Legacy letter feature             | Pro tier upsell. Parked until core product stable                        |
| F5 | Recorded farewell video messages  | Premium concept. Parked until real user testing                          |
| F6 | PWA / native app                  | Deferred until real users and traction                                   |

---

## 📈 Growth / Distribution

[#-growth--distribution](#-growth--distribution)

| #  | Task                                     | Notes                                                                                                             |
| --- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| G1 | Retirement home / community centre talks | Target activities directors, not residents. Libraries also good. Need leave-behind PDF first                      |
| G2 | Willful partnership pitch                | ⚠️ STATUS CONFLICT: this was marked "parked until real users" but is currently flagged as the single highest-leverage next action. Resolve and update before next session — don't let both statuses coexist. |
| G3 | B2B employer benefits channel            | After Willful                                                                                                     |
| G4 | SEO — meta descriptions audit            | Check all learn pages have proper meta descriptions                                                               |
| G5 | Eirene founder conversation              | Company wound down. Friend is free agent with deep end-of-life tech context. Worth a real co-founder conversation |

---

## 🔧 Technical / Infrastructure

[#-technical--infrastructure](#-technical--infrastructure)

| #  | Task                                    | Notes                                                                                 |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| T2 | Custom SMTP setup                       | Resend + Supabase SMTP settings. Do before opening to strangers (duplicate of P2 — keep one, recommend tracking under P2 only) |
| T3 | Update sitemap.xml when new pages added | Add new learn pages to sitemap and push to repo                                       |
| T4 | PostHog reverse proxy                   | Routes tracking through clarevo.ca domain, bypasses ad blockers. Low priority for now |

---

## ✅ Completed

[#-completed](#-completed)

| Task                                 | Notes                                                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| PostHog analytics installed          | All 12 pages instrumented. Web Analytics + Product Analytics live. assessment_started and partner_link_clicked events wired |
| PostHog authorized domains           | clarevo.ca and www.clarevo.ca added                                                                   |
| Password gate removed                | `index.html` redirects straight to `home.html`                                                                                |
| Google Search Console verified       | clarevo.ca verified, sitemap.xml submitted                                                                                     |
| sitemap.xml built and submitted      | All public learn pages included                                                                                                |
| hello@clarevo.ca email             | Namecheap forwarder → kapilan@outlook.com. Outlook rule routes to Clarevo folder. Tested and working                         |
| Supabase email templates             | Confirm signup, magic link, invite user, reset password — all updated to Clarevo branding                                      |
| Home page comparison table           | Rebuilt — unified table, "Without Clarevo" / "With Clarevo", mobile-friendly                                                   |
| Home page layout fixes               | Full-bleed sections fixed, footer no longer floating, CTA section properly wrapped                                             |
| learn-probate.html                   | New page — when you need probate, 6 avoidance strategies, risks, embedded calculator                                           |
| learn-executor.html                  | Full rebuild — 13-step process, liability, probate, tax table, CRA clearance, Clarevo callout                                  |
| learn.html rebuilt                   | Crisis card dominant, stats tiles, article grid, probate as tile, no emojis                                                    |
| learn-when-someone-dies.html         | Full crisis article — 13 steps, admin checklist, cost breakdown                                                                |
| Nav bar fixed across all learn pages | All pages consistent: How it works → Learn → Pricing → Log In → Check Your Score                                              |
| Home page stat update                | 53% → 50%, source updated to Angus Reid Institute 2023                                                                         |
| Pricing page update                  | Free = 1 PDF binder, Pro = unlimited updates + shared dashboard                                                                |
| learn-poa.html                       | Provincial naming note added                                                                                                   |
| PDF binder generator                 | plan-binder.html — jsPDF, Letter size, TOC, call scripts                                                                       |
| Shared access system                 | Invite flow, per-section toggles, shared-welcome + shared-view                                                                 |
| Magic link login                     | Added to login.html                                                                                                            |

---

## 💡 Parked Ideas

[#-parked-ideas](#-parked-ideas)

- Province-specific intestate succession flowcharts
- "Cost of dying" full calculator (deemed disposition + probate by province)
- Cadence-style post-death executor assistant
- Legacy letter / ethical will as Pro feature

---

*Last updated: June 2026*
