# Clay Design System — Developers Page & WCAG Contrast Fixes

**Date**: 2026-07-19 20:00  
**Severity**: High  
**Component**: Design system tokens, landing page, new `/developers` route  
**Status**: Resolved

## What Happened

Designed and shipped "For developers" teaser section on the landing page, footer link, and new `/developers` page showcasing 5 CLI commands with equal visual weight plus a terminal mock demoing the `drop-plan` Claude Code skill. Discovered CLAUDE.md was stale — the Clay design system was already live in production (commits 7d6cc17, ec5e67d, ebe4c40, 7fc9995) from an earlier session, contradicting the documented "dark mode + violet" architecture. During design review, uncovered systemic WCAG AA contrast failures in the Clay tokens themselves; fixed mechanically using relative-luminance formula. Code review caught 2 related issues: a11y regression in the new landing terminal mock and hardcoded hex values in og-image and embed pages that should have been tied to the token fix.

## The Brutal Truth

Almost overscoped this entire task. CLAUDE.md was so stale it made us question whether a "full rebrand" was still needed. That's a painful reminder to always verify documented architecture against `git log` and actual file state before treating docs as ground truth — cost us 30 minutes of uncertainty mid-session. The WCAG contrast issue was worse: Clay tokens themselves shipped with 3.6–3.9:1 contrast ratios, below the 4.5:1 AA minimum for body text. That's a systemic design system failure that affected every page. And the hardcoded hex values? They were tucked away in image generation and embed fallbacks — places the original fix scope never touched — but they needed to move in lockstep with the token changes or they'd contradict each other.

## Technical Details

**Stale Documentation Root Cause**:
- CLAUDE.md stated "dark mode default + violet primary + emerald success" as if current
- Clay system was already the live default: `app/globals.css` contains OKLCH color tokens from earlier commits
- Verification: `git log --oneline app/globals.css | head` showed 4 Clay commits, none recent

**WCAG AA Contrast Failures in Clay Tokens** (all measured against white text):
- `--muted-foreground` (#7a6a60 before → #766860 after): 3.6:1 → 4.51:1
- `--primary` / `--accent` / `--meta` / `--ring` / `--sidebar-primary` (#b46a46 before → #9a5b3c after): 3.8:1 → 4.6:1
- `--success` (#4d8f5a before → #468352 after): 3.9:1 → 4.52:1

Computed using relative-luminance formula per WCAG 2.1: `L = 0.2126 * R + 0.7152 * G + 0.0722 * B` for 8-bit RGB. Replacement hex values verified to pass `(L1 + 0.05) / (L2 + 0.05) >= 4.5` check.

**Code Review Findings**:
1. Landing page terminal mock: one output line wasn't wrapped in `aria-hidden`, leaking context-free string to screen readers
2. Hardcoded hex values in `app/api/og-image/[slug]/route.tsx` (social preview image generator; can't read CSS custom properties at build time) and fallback values in `app/(public)/embed/[slug]/page.tsx` still used pre-fix hex values, contradicting the token update

## What We Tried

1. **Design Review** (ui-ux-designer subagent): Found and fixed 8 scoped a11y/consistency issues in Open Design mockups
2. **Contrast Calculation**: Computed WCAG-compliant replacement values mechanically rather than eyeballing
3. **Implementation** (ui-ux-designer subagent): 3-phase plan with token fix, landing section, footer, new `/developers` page
4. **Code Review + Test** (code-reviewer + tester subagents in parallel):
   - Tester: lint clean (88 baseline, 0 new), build clean, `/developers` renders
   - Code-reviewer: found 2 real issues, flagged prior unrelated doc changes in working tree

## Root Cause Analysis

**Why docs were stale**: No mechanism to sync CLAUDE.md when design system commits land. Git history is ground truth; docs are aspirational notes that diverge over time.

**Why WCAG failures existed**: Clay token design didn't verify contrast ratios against all backgrounds. Acceptable assumption at design time, but should have been caught before shipping to production.

**Why hardcoded values leaked**: Phase-01 scope focused on CSS-var consumers in the renderer. og-image (build-time image generation) and embed page (fallback values) weren't on the file list because they seemed separate. But they needed to move together — fixed proactively rather than filed as follow-up, since both were small, low-risk, and directly related to the same root cause.

## Lessons Learned

1. **Docs vs Code**: Always cross-reference CLAUDE.md against current `git log` and file state before trusting documented architecture. Stale docs create decision noise.
2. **Token Decisions Need Mechanical Rigor**: WCAG contrast fixes aren't design opinions — compute them using the luminance formula, test programmatically, apply as a shared token fix (benefits all consumers at once, not a page-local patch).
3. **Review-Driven Scope Creep Is Often Right**: When code review flags related files outside the original scope, fix them together if they're small and low-risk. Separating them creates coordination debt and contradictory behavior.
4. **Build-Time Constraints Affect Token Strategy**: og-image can't read CSS custom properties at build time. Fallback values and build-time values need explicit synchronization strategy (here: a shared JS hex constant exported from the token definition).

## Next Steps

- Add a docs-sync check to the PR/commit process: CLAUDE.md architecture sections must be verified against recent commits in changed files
- Document the WCAG token methodology (luminance formula + 4.5:1 minimum) in `docs/design-guidelines.md` so future token edits follow the same rigor
- Audit og-image and embed pages for any other hardcoded color values that might have drifted from the token update
- Monitor production for any remaining visual inconsistencies from the contrast fix

