# Skill: sync-to-code

Sync token values from `tokens/tokens.json` into `constants/theme.ts`.

Use this after Figma/Tokens Studio pushes updated token values to GitHub.

## Steps

1. Run `npx tsx scripts/sync-to-code.ts --dry-run` to preview changes.

2. Review the diff output. Confirm the changes make sense:
   - Primitive color values updated?
   - Semantic dark/light mappings changed?
   - No unexpected deletions?

3. If the diff looks correct, run `npx tsx scripts/sync-to-code.ts` to apply.

4. Run `npx tsc --noEmit` to verify no type errors introduced.

5. Show the user the summary of what changed.

## What gets updated

- `primitives` object in theme.ts (hex values from `primitive/color`)
- `dark` object (resolved values from `semantic/dark`)
- `light` object (resolved values from `semantic/light`)

## What is preserved (not touched)

- `SemanticColors` interface
- `varNameMap` object
- `getColors()` and `getThemeVars()` functions
- `typography` presets
- `duration`, `easing`, `opacity`, `borderWidth` token objects
- `statusColors` and `fonts`
- All imports
