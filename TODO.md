# Clarevo — Running To-Do List

[#clarevo--running-to-do-list](#clarevo--running-to-do-list)
> Update this file as things get done or added. Open it at the start of every session.
> Status: ✅ Done · 🔨 In Progress · 🔲 Not Started · ⏸ Parked

---

## 🧭 Context (read this first, especially in a new chat)

- What Clarevo is: A family readiness diagnostic and emergency binder system. Clarevo helps families identify gaps in financial/legal readiness, organize key information, and generate a practical plan their loved ones can use during an emergency.
- What Clarevo is not: Clarevo is not a will platform, estate lawyer, financial advisor, broad cloud vault, or password manager.
- Storage position: Clarevo may store or organize narrowly defined emergency-readiness documents and information, such as wills/POA location, insurance details, account lists, property information, benefits, contacts, funeral wishes, and uploaded PDFs where the user chooses to keep a copy. Storage supports the emergency plan; it is not the main product promise.
- Password position: Clarevo should not ask for or digitally store user passwords. The binder may include printable password inventory and digital access worksheets that users complete by hand after printing and keep in a secure physical location.
- Core positioning: Market the outcome, not the storage: "Create a clear emergency plan your family can actually use — documents, accounts, contacts, gaps, and next steps in one organized place."
- Partner strategy: Clarevo should not compete with Willful, Wealthsimple, insurers, or estate lawyers. Position as "before and after the will" — identifying gaps, organizing readiness, and routing users to trusted partners.
- The business bet: Product quality is table stakes. Distribution is the real bottleneck. One strong distribution partnership, employer channel, or community channel matters more than paid social at this stage.
- Current focus: Tighten the product narrative, complete trust/privacy basics, and prepare for real-world user testing before pushing wider distribution.
- Stack at a glance: Static HTML/CSS/JS on GitHub Pages, Supabase backend, private documents bucket, PostHog analytics, jsPDF for binder generation.
- Cost discipline: Default to free/low-cost tools until there is real traction. Test with real users before infrastructure upgrades.

---

## 🔥 Next Up — High Priority

[#-next-up--high-priority](#-next-up--high-priority)

| #  | Task                                       | Notes                                                                                                                        |
| --- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| P1 | Wire assessment_completed event           | Call `window.clarevo_trackAssessmentComplete(score, province)` in `form.html` when assessment saves to Supabase              |
| P2 | Custom SMTP — send from hello@clarevo.ca | Use Resend (free up to 3,000 emails/mo). Set up in Supabase → Authentication → SMTP Settings. Do before opening to strangers |
| P3 | Lead data capture for partner referrals — `partner_clicks` table | New Supabase table: user_id, partner, gap_category, province, timestamp. (Same task as T1 below — tracked once here, removed from Technical section) |
| P4 | PIPEDA consent + privacy boundaries | Add third-party data sharing consent to assessment flow and privacy page before any lead selling. Also clarify what Clarevo stores, what it does not store, and that passwords should only be completed by hand in the printed binder. |                         |
| P5 | `learn-when-someone-dies.html` tone pass   | Soften CTA at bottom — "Get Your Free Readiness Score" is wrong tone for a grief article                                     |
| P6 | G1 — Boots on ground leave-behind PDF      | One-page printable: probate fee table, death checklist, QR code to clarevo.ca. Needed before retirement home visits          |
| P7 | Privacy/trust copy update | Clearly explain that Clarevo is not a password manager, does not request or store passwords, and only organizes emergency-readiness information chosen by the user. |

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
- Full digital password manager functionality
- Zero-knowledge encrypted vault architecture

---

*Last updated: June 2026*
