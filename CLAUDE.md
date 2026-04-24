# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A React/Vite/TypeScript Sage app ("Exploiticon") intended as a **community exploit demonstration and test harness** for the [Sage](https://github.com/xch-gallery/sage) wallet host application. The goal is a tool where contributors can add new exploit demonstrations, each targeting a specific class of vulnerability in the Sage bridge/host. It is for authorized security research only — not production use.

Each exploit is self-contained: it documents the vulnerable host-side code, demonstrates the attack interactively, and proposes a mitigation.

## Commands

```bash
pnpm install       # install deps (sdk resolved from local path, see below)
pnpm dev           # vite dev server (default port 5173, HMR)
pnpm build         # tsc -b && vite build && sage-app finalize-manifest
pnpm preview       # serve built dist at http://localhost:3666
pnpm lint          # eslint .
```

After `pnpm build`, install into Sage by URL (`http://localhost:3666`). The app cannot run standalone in a browser — it requires the Sage runtime bridge injected by the host.

## SDK Dependency

`@sage-app/sdk` is resolved from a local path: `../../Hadamcik/sage/packages/sage-app-sdk`. This must exist on disk before `pnpm install`. If the path changes, update `package.json` accordingly.

## Architecture

**Entry point** (`src/main.tsx`): Calls `initSageRuntimeBridge()` from the SDK. If not running inside Sage, renders `<SageRequired />` fallback. If running inside Sage, renders `<App />` in a `HashRouter` (hash routing required for Sage's embedded webview).

**`useSageClient` hook** (`src/hooks/useSageClient.ts`): Singleton that lazily calls `getSageClient()` and integrates with React Suspense by throwing a promise until resolved. Pages wrapped in `<Suspense>` (set in `App.tsx`) suspend while the SDK initializes.

**Logging** (`src/lib/logStore.ts`): A simple pub-sub store (no React state, no external library). Pages call `addLog(message, kind)` to append entries; `LogPanel` subscribes via `subscribeLogs`. All pages display logs at the bottom via `PageShell`.

**`PageShell`** (`src/components/PageShell.tsx`): Wraps every page with nav links, title/subtitle, page content, and a `LogPanel`.

**Pages**: `HomePage` is the exploit directory — cards grouped by vulnerability class (Dialog/Approval, Capability Escalation, Network/SSRF, Storage, DoS). Each exploit has its own route and page. `ExploitPage` (`/approval-flood`) is the canonical template.

**Navigation**: `PageShell` renders a minimal nav bar — `Home` + one red-styled button per exploit. The `EXPLOITS` array at the top of `PageShell.tsx` is the single place to register new entries in the nav. When exploit count grows large, the home page cards become the primary entry point and the nav can be trimmed to just `Home`.

## Adding a New Exploit

1. Add a page in `src/pages/` modeled on `src/pages/ExploitPage.tsx` — include: vulnerability description, interactive trigger buttons, host-side code location (file + line), and proposed mitigation
2. Register the route in `App.tsx`
3. Add an entry to the `EXPLOITS` array in `src/components/PageShell.tsx` (nav bar)
4. Add an `ExploitEntry` to the appropriate category in `src/pages/HomePage.tsx` (index card)
5. Use `addLog(message, kind)` from `src/lib/logStore.ts` for all observable output (`'info'` / `'ok'` / `'fail'`)
6. Call the Sage SDK via `useSageClient()` — the hook handles Suspense and singleton lifecycle
7. Declare any new required/optional capabilities or network entries in `sage-manifest.json`

## Sage Manifest

`sage-manifest.json` declares the app's name, version, and permissions (network whitelist + capabilities). The `pnpm sage:finalize` step (`sage-app finalize-manifest`) merges this into `dist/sage-manifest.json` as part of the build. Add capabilities here (`optional` is preferred) before calling them via the SDK.

## Current Exploit: Approval Dialog Flood (ExploitPage)

Vulnerability in `sage/crates/sage-apps/src/bridge/mod.rs` lines 427–442: `app.request_capability_grant` stores each request in an unbounded `BTreeMap<String, PendingBridgeApproval>` with no rate limiting, deduplication, or per-app cap. The page fires N simultaneous `requestCapabilityGrant('wallet.send_xch')` calls to flood the host with approval dialogs before the user can dismiss the first.
