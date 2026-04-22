---
name: audit-code
description: 扫描组件代码中的硬编码色值、非体系字号/字重/圆角/间距、未使用 token 等不规范用法
---

# Skill: audit-code

Scan component code for hardcoded values that should use design tokens.

## Steps

1. **Hardcoded hex colors** — search `.tsx` files in `app/` and `components/` for hex color values (`#[0-9a-fA-F]{3,8}`) that are NOT inside `constants/theme.ts`. These should use semantic tokens like `bg-brand`, `text-primary`, etc.

   Exclude: `constants/theme.ts` (it defines the tokens), SVG `fill`/`stroke` in icon components, and `#FFFFFF` / `#000000` used in `textOnBrand`.

2. **Hardcoded rgba** — search for `rgba(` patterns in `.tsx` files outside `constants/theme.ts`. These should typically be replaced with semantic border/overlay tokens.

   Exclude: `constants/theme.ts` primitive definitions.

3. **Non-system font sizes** — search for `text-[` arbitrary Tailwind classes with pixel values that don't match the 10-step scale (10/11/13/14/15/17/20/22/28/34px).

4. **Non-system font weights** — search for `font-[` arbitrary Tailwind classes with values that don't match the 6-step scale (380/430/450/510/590/680).

5. **Non-system border radius** — search for `rounded-[` arbitrary Tailwind classes with values that don't match the 5-step scale (0/4/8/12/16/9999px).

6. **Non-system spacing** — search for `p-[`, `m-[`, `gap-[`, `space-[`, `px-[`, `py-[`, `mx-[`, `my-[` arbitrary Tailwind classes with values that don't fall on the 8px grid (0/2/4/8/12/16/20/24/32/40/48/64/80px).

7. **Hardcoded opacity** — search for `opacity-` Tailwind classes with numeric values (like `opacity-40`, `opacity-50`) that should use semantic tokens (`opacity-disabled`, `opacity-press`, `opacity-muted`, `opacity-subtle`).

8. **Hardcoded border-width** — search for `borderWidth:` in style objects with numeric literals (like `borderWidth: 1`) that should use `borderWidth.thin` etc. from theme.

9. **Hardcoded duration** — search for `duration:` in `withTiming()` calls with numeric literals (like `{ duration: 200 }`) that could use `duration.fast` etc. from theme. Exclude animation-specific durations (>= 800ms) that are intentionally component-specific.

10. **Unused semantic tokens** — check every key in the `SemanticColors` interface against usage in `app/` and `components/`. Report any token that is defined but never referenced (neither via Tailwind class nor `getColors()`).

## Output

For each check, report:
- Total violations found
- For each violation: file path, line number, the hardcoded value, and the suggested token replacement

At the end, summarize: total violations, total files affected, and a priority list (most frequent violations first).
