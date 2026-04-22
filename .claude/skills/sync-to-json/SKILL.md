---
name: sync-to-json
description: 从 constants/theme.ts 同步 token 值到 tokens.json（代码改完后同步到 Figma 用）
---

# Skill: sync-to-json

Sync token values from `constants/theme.ts` into `tokens.json`.

Use this after modifying token values in code, so Figma stays in sync.

## Steps

1. Run `npx tsx scripts/sync-to-json.ts --dry-run` to preview changes.

2. Review the diff output. Confirm the changes make sense:
   - Only the modified values show up?
   - References (`{color.xxx}`) are correctly generated?
   - No `$themes` or `$metadata` changes?

3. If the diff looks correct, run `npx tsx scripts/sync-to-json.ts` to apply.

4. Validate the result: run `/validate` to check tokens.json integrity.

5. Commit and push so Tokens Studio can pull the update into Figma.

## What gets updated

- `primitive/color` token values (from `primitives` object)
- `semantic/dark` token values (from `dark` object, converted back to references)
- `semantic/light` token values (from `light` object, converted back to references)

## What is preserved (not touched)

- `$themes` and `$metadata`
- `$type` and `$description` on every token
- All non-color token sets (typography, spacing, radius, shadow, border-width, motion, opacity)
- Token structure and nesting
