# Product Requirements — Pairflix

> Rewritten 2026-08-16 for the household pivot. The previous PRD described the retired two-user
> watchlist-matching product; that direction is dead. Product intent tracks the venture page
> (`ideasquared-website/ventures/pairflix/`) and the Notion business plan.

## Summary

Pairflix is the **"what should WE watch tonight" decision layer** for couples and households. Given a
household, a mood, and a time budget, it returns **one** agreed title in under 30 seconds, with the
streaming services it's actually available on surfaced on the card. It sits on top of the
subscriptions a household already pays for; it does not replace them.

The product solves a **decision**, not discovery and not playback. Netflix profiles are
single-platform and individual-first; Teleparty syncs playback; generic recommenders optimise for one
viewer. Pairflix is the only layer designed around the **household** choice.

## Who it's for

UK couples and households (initially) who share streaming subscriptions and lose time every night to
"what shall we watch?". One household = two or more members with joined taste profiles.

## The core loop

1. A household member opens the Tonight picker and sets **mood** + **time budget** (e.g. "30 minutes,
   something funny"), optionally a region.
2. Pairflix merges the members' taste profiles, asks TMDb what fits, scores candidates against mood /
   time / taste, and filters to titles streamable on the household's services.
3. It returns **one** title with provider deep-links. The household **accepts**, **swaps** for the
   next candidate, or **dismisses**.
4. On accept + launch, it records what they actually watched (`watched_together`) and captures a
   thumbs signal afterwards, which sharpens the household's taste over time.

Success is measured on the loop: **time-to-decision** (target: under 30s) and **first-pick acceptance
rate** (the household takes the first title offered).

## Features

### Free tier

- Household pair profile (join two+ members).
- Mood + time-budget Tonight picker.
- Up to **3 picks/day**, single region (GB), ad-light.
- Cross-platform provider badges with deep-links.
- Watch-together history with thumbs.

### Premium (per household, monthly)

- **Unlimited** picks.
- **Multi-region** providers (for households that straddle regions or travel).
- **LLM-assisted re-ranking** of the shortlist (opt-in, off by default on the platform).
- Richer watch-together history.

### Admin

- User management, content moderation, basic platform metrics. Staff-only.

## Non-goals (explicit)

- **Not** a social network — no feeds, groups, watch parties, DMs, or comments. (The old Phase-4
  "social entertainment platform" roadmap is retired.)
- **Not** user-to-user matchmaking / "find a viewing partner". The household is assumed already paired.
- **Not** a personal watchlist manager as the headline product. Taste is seeded from a light
  onboarding step and learned from watched-together thumbs; the old personal watchlist is retired and
  is **not** a taste input. A lightweight "save for tonight" list may return later as a convenience,
  but taste won't depend on it.
- **Not** a player. Pairflix hands off to the streaming app; it never streams.

## Success metrics

| Metric                     | Target                                              |
| -------------------------- | --------------------------------------------------- |
| Time-to-decision           | < 30 seconds                                        |
| First-pick acceptance rate | the north-star; grow it release over release        |
| Free → premium conversion  | 3% (Y1) → 7% (Y3), per the seed plan                |
| Provider click-through     | tracked via `pick_events` for affiliate attribution |

## Current status (alpha, pre-launch)

No public users, no waitlist, no launch date. The household model, the pick endpoint, providers,
entitlements/quota, and the Tonight / History / Households / Billing frontends are built. Known gaps
before a closed alpha: the LLM re-rank is built but not wired into the recommender; billing is
mock-only (no Stripe); the recommender is movie-only; pivot endpoints lack integration tests; and the
platform is mid re-platform onto Cloudflare (ADR 0001). See `docs/roadmap.md`.

## Constraints

- TMDb is the metadata + provider source; respect its rate limits; treat provider data as best-effort
  and region-locked.
- The pure-ML pick path must work without the LLM; the LLM only ever re-ranks, never gates.
- Premium billing stays mock until Stripe go-live is signed off.
