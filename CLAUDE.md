# Claude Instructions — Zettlab Design Tokens

Zettlab Design Token System. Three-layer architecture (Primitive → Semantic → Component). Read docs before making changes.

## The only file that matters

`tokens.json` — all tokens live here in W3C DTCG format (Tokens Studio compatible).

## Rules

### Never touch
- `$themes` — Figma Tokens Studio configuration
- `$metadata` — Token Studio metadata

### Always follow
- Reference direction: `primitive/*` → `semantic/*` (semantic references primitive, never reverse)
- Hex colors in UPPERCASE (`#6366DE`, not `#6366de`)
- `$description` values in lowercase with no trailing spaces
- Every token must have `$type`
- No compound tokens (a node cannot have both `$value` and non-`$` children)
- `semantic/dark` and `semantic/light` must define identical token paths

### Token types
`color`, `fontSizes`, `fontWeights`, `lineHeights`, `letterSpacing`, `fontFamilies`, `spacing`, `borderRadius`, `boxShadow`, `borderWidth`, `duration`, `number`

### Validation
Run `skills/validate.md` before committing. Check:
1. No broken references
2. dark/light mode parity
3. Hex UPPERCASE
4. Every token has `$type`
5. `$description` formatting
6. `$metadata` completeness

## Architecture

```
primitive/color          → raw color palettes (gray, warm, indigo, status)
primitive/typography     → font sizes, weights, line-heights, letter-spacing
primitive/spacing        → 8px grid spacing scale
primitive/radius         → border radius (5 steps + full)
primitive/shadow         → box shadows (5 levels)
primitive/border-width   → border widths (4 steps)
primitive/motion         → animation durations
primitive/opacity        → opacity presets
semantic/dark            → dark mode color mappings (references primitive)
semantic/light           → light mode color mappings (references primitive)
```

## Skills

| Skill | Purpose |
|-------|---------|
| `skills/validate.md` | Validate tokens.json against conventions |
| `skills/audit-code.md` | Scan code for hardcoded values |
| `skills/sync-to-code.md` | Sync tokens.json → theme.ts |
| `skills/sync-to-json.md` | Sync theme.ts → tokens.json |

## Documentation

| File | Purpose |
|------|---------|
| `docs/impeccable.md` | Brand context, design principles, do's/don'ts |
| `docs/components.md` | Component specifications, responsive, agent guide |
| `docs/token-sync-spec.md` | Sync architecture, token scope, implementation |
