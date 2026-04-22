---
name: validate
description: 检查 tokens.json 规范性（引用完整性、dark/light 对称、hex 大写、$type 齐全、theme.ts 漂移）
---

# Skill: validate

Validate `tokens.json` against Zettlab design system conventions.

## Steps

1. Load `tokens.json`.

2. **Broken references** — collect all `{token.path}` references from `$value` fields. Collect all defined token paths. Report any reference that does not resolve to a defined token.

3. **Missing `$type`** — every token with a `$value` must also have a `$type`. Report any that do not.

4. **Hex color casing** — all hex color values must be UPPERCASE (e.g. `#6366DE`). Report any lowercase hex values and their exact token path.

5. **Mode parity** — `semantic/dark` and `semantic/light` must define the exact same set of token paths. Report any token present in one but missing in the other.

6. **`$description` quality**
   - Must start with a lowercase letter
   - Must not end with a space
   - Report all violations with token path and current value

7. **No compound tokens** — find any token node that has both a `$value` and non-`$` children. A node must be either a leaf or a group, never both.

8. **`$metadata` completeness** — every top-level key (excluding `$themes` and `$metadata`) must appear in `$metadata.tokenSetOrder`. Report any missing.

9. **theme.ts drift** — compare resolved values in `semantic/dark` and `semantic/light` against the actual hex values in `constants/theme.ts`. Report any mismatches.

## Output

Report each check with a clear pass or fail status. For failures, list every affected token path and the specific issue. At the end, summarize total issues found.
