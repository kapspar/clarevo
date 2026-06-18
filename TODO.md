# Clarevo — Running To-Do List

> Update this file as things get done or added. Open it at the start of every session.
> Status: ✅ Done · 🔨 In Progress · 🔲 Not Started · ⏸ Parked

---

## 🚨 Blocked — Decide First

| # | Task | Why Blocked |
|---|------|-------------|
| B1 | Password gate strategy | Everything below depends on this. Options: (a) remove entirely, (b) keep on dashboard/auth pages only, (c) leave as-is for now |
| B2 | Google Search Console + sitemap.xml | Don't submit while password gate is on — Google will crawl the wall |
| B3 | Analytics platform | Plausible (simpler, privacy-first, $9/mo) vs PostHog (free tier, more powerful). Decide then instrument |

---

## 🔥 Next Up — High Priority

| # | Task | Notes |
|---|------|-------|
| P1 | Set up hello@clarevo.ca email | Use Namecheap email forwarding (free) or Zoho Mail (free tier). Needed for contact forms, partner outreach, and user support |
| P2 | Analytics instrumentation | 3 key events: assessment started, assessment completed, partner link clicked. Goes in `form.html` and `dashboard.html` |
| P3 | Lead data capture for partner referrals | Log partner link clicks with user context (province, gaps found) to Supabase. This is the data Faisal mentioned selling |
| P4 | PIPEDA consent | Add third-party data sharing consent to assessment flow and privacy page before any lead selling |
| P5 | Home page emoji pass | Strip emojis from learn carousel cards on `home.html` — feels AI-generated |
| P6 | `learn-when-someone-dies.html` tone pass | Soften the CTA at bottom — "Get Your Free Readiness Score" is wrong tone for a grief article |

---

## 📋 Product / Feature

| # | Task | Notes |
|---|------|-------|
| F1 | PDF binder — enforce 1 free limit | Add `pdf_generation_count` check in dashboard before generating. Free = 1, Pro = unlimited |
| F2 | Physical printed binder | Research print-on-demand fulfillment (Printful, Lulu, local print shop). Target $49–79. Plant the seed on pricing page ✅ done |
| F3 | Legacy letter feature | Pro tier upsell. Written message to family. Park until core product is stable |
| F4 | Recorded farewell video messages | Premium feature concept. Parked — build after real user testing |
| F5 | PWA / native app | Explicitly deferred until real user testing complete |

---

## 📈 Growth / Distribution

| # | Task | Notes |
|---|------|-------|
| G1 | Boots on ground materials | One-page printable leave-behind PDF: probate fee table, death checklist, QR code to clarevo.ca |
| G2 | Willful partnership pitch | Parked until first real users. They need to see engagement data |
| G3 | Retirement home / community centre talks | Target activities directors not residents directly. Libraries also good venue |
| G4 | B2B employer benefits channel | Outreach to HR teams and benefits brokers. After Willful |
| G5 | Google Search Console setup | Submit sitemap.xml after password gate resolved |
| G6 | SEO — meta descriptions audit | Check all learn pages have proper meta descriptions |

---

## 🔧 Technical / Infrastructure

| # | Task | Notes |
|---|------|-------|
| T1 | hello@clarevo.ca email setup | See P1 above — do this first |
| T2 | Supabase lead logging table | New table: `partner_clicks` — user_id, partner, gap_category, province, timestamp |
| T3 | Sitemap.xml | Generate and add to repo root. Submit to Search Console after gate decision |
| T4 | POA page provincial language update | ✅ Done — added provincial naming note (Personal Directive, Representation Agreement, etc.) |

---

## ✅ Recently Completed

| Task | Notes |
|------|-------|
| Rebuilt `learn.html` | Two-intent hub: crisis + planning. Probate widget with all 13 provinces |
| Built `learn-when-someone-dies.html` | Full crisis article — 13 steps, admin checklist, cost breakdown |
| Home page comparison table | Without vs. with Clarevo — 6 rows |
| Home page stat update | 53% → 50%, source updated to Angus Reid 2023 |
| Pricing page update | Free = 1 PDF, Pro = unlimited PDF updates, shared dashboard |
| PDF binder generator | `plan-binder.html` — jsPDF, Letter size, TOC, call scripts |
| Shared access system | Invite flow, per-section toggles, `shared-welcome.html`, `shared-view.html` |
| Magic link login | Added to `login.html` |
| Pitch deck | 11 slides, Clarevo brand colors, for friend/potential CTO meeting |

---

## 💡 Ideas Parked — Not Prioritized

- Legacy letter / ethical will as Pro feature
- Province-specific intestate succession flowcharts (like the Ontario one from Wealthsimple)
- "Cost of dying" calculator (full deemed disposition + probate estimate by province)
- Cadence-style post-death executor assistant feature
- Eirene partnership (company wound down — friend is now free agent, potential co-founder conversation)

---

*Last updated: June 2026*
