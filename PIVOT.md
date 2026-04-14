# Pivot Notice — CeLesteCMS Pro → EmDash Ecosystem

**Decision date:** 2026-04-09
**Status:** CeLesteCMS Pro standalone development is discontinued.
**Continuing under:** [Discerneco](https://github.com/Discerneco) — building the EmDash plugin ecosystem.

---

## What happened

On **2026-04-02**, Cloudflare launched [**EmDash**](https://github.com/emdash-cms/emdash), an official Cloudflare-built CMS on the same infrastructure CeLesteCMS Pro targeted — Cloudflare D1 for storage, Workers for compute, edge-first delivery — aimed at the same market we were pursuing (a modern WordPress replacement with a plugin ecosystem).

Competing with the platform owner on their own stack is not a winnable position for a solo/small team. EmDash isn't a threat — it's a validation of the direction, built by the company whose infra we depend on.

## Why pivot rather than carry on

Four independent factors aligned:

1. **Platform owner competition is structural.** Cloudflare can iterate faster on D1/Workers features, ship official SDKs, bundle deployment, and place EmDash in their marketing. A third-party CMS on the same infra can't match that distribution.
2. **The Astro direction was already ours.** We had independently concluded Astro was the better substrate for a CMS than SvelteKit — EmDash's choice of Astro made this easier, not harder, to accept. The core belief was right; the packaging just shipped from elsewhere.
3. **EmDash ships the hard parts we'd have had to build.** Sandboxed plugin isolates on Dynamic Workers solve the plugin security problem that made WordPress dangerous. Portable Text, schema-in-DB, Passkeys + OAuth auth, Kysely typed queries, Lingui-based admin i18n, and a built-in MCP server are all production-grade and open-source. Recreating them would have consumed years.
4. **Bigger opportunity in the plugin layer.** The EmDash plugin ecosystem is effectively empty (one plugin on the community marketplace as of the pivot). First-mover advantage on quality commercial plugins — backup & recovery, multi-site management, translation workflows, LGPD — is worth more than a 91st-place WordPress-replacement CMS.

## What CeLesteCMS Pro got right (and keeps)

This repo represents ~90% of an MVP built over many months. The learnings carry forward:

- **Edge-first CMS architecture** on Cloudflare D1 + Pages/Workers
- **Svelte 5 runes + TailwindCSS v4 + DaisyUI** admin patterns (UX research that informs plugin admin pages)
- **Custom Oslo + Arctic authentication** — working, understood security primitives
- **Paraglide i18n** language switching in a CMS admin context (directly applicable to EmDash's Lingui integration)
- **Static site generation with hybrid dynamic embeds** (Horizonte template system)
- **Multi-site architecture thinking** — direct input into the upcoming Multi-site Manager plugin

## What happens next

**Active work moves to EmDash.** Identity split:

| Surface | Account / Org |
|---|---|
| Core/upstream contributions to EmDash | [@csfalcao](https://github.com/csfalcao) (personal) — Cloudflare CLA signed |
| Commercial and open-source EmDash plugins | [Discerneco](https://github.com/Discerneco) (company org) |
| Company & strategy | [discerne.co](https://discerne.co), [Discerneco/strategy](https://github.com/Discerneco/strategy) (private) |

**First upstream contributions** (both merged):

- [emdash-cms/emdash#424](https://github.com/emdash-cms/emdash/pull/424) — `fix(middleware): allow public access to search API` — made the shipped `<LiveSearch>` component functional for public sites
- [emdash-cms/emdash#558](https://github.com/emdash-cms/emdash/pull/558) — `fix(core): /search/suggest crash from double-star FTS5 prefix` — fixed a 500 on every autocomplete query

**First commercial plugin in development:** Backup & Recovery — no current competitor in the EmDash ecosystem; proven market ($70–$195/yr pricing in the WordPress analog space).

## What this repo is now

Read-only archive. No new features, no bug fixes, no security patches. It exists for:

- **Historical reference** — the arc of the project, the design decisions, the documentation
- **Portfolio artifact** — the code and docs are public proof of what Discerneco can build
- **Idea quarry** — specific UX patterns, i18n approaches, and multi-site thinking will be revisited when building the corresponding EmDash plugins

The repository will be marked **Archived** on GitHub after this notice lands, which disables issues, pull requests, and future commits while preserving all content and history.

## Questions or follow-ups

- Open issues and discussions about EmDash plugins in the relevant Discerneco plugin repos (coming soon).
- Contact: via [discerne.co](https://discerne.co) or `@csfalcao` on GitHub.

---

*This notice was written on 2026-04-14, five days after the pivot decision, as part of closing out the CeLesteCMS Pro repository cleanly.*
