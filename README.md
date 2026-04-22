# Zettlab Design Tokens

Design token system for Zettlab — a mobile-first AI Agent platform.

Three-layer architecture: **Primitive → Semantic → Component**, with bidirectional sync between Figma and code via Tokens Studio + GitHub.

## Structure

```
tokens/
  tokens.json              W3C DTCG format, Tokens Studio compatible
docs/
  impeccable.md            Brand context & design principles
  components.md            Component specifications & responsive behavior
  token-sync-spec.md       Sync architecture & implementation spec
skills/
  validate.md              Token convention checker
  audit-code.md            Hardcoded value scanner
  sync-to-code.md          Figma → code sync guide
  sync-to-json.md          Code → Figma sync guide
scripts/
  sync-to-code.ts          tokens.json → theme.ts
  sync-to-json.ts          theme.ts → tokens.json
```

## Token Inventory

| Category | Count | Token Set |
|----------|-------|-----------|
| Colors (primitive) | 59 | `primitive/color` |
| Typography | 32 | `primitive/typography` |
| Spacing | 13 | `primitive/spacing` |
| Border Radius | 6 | `primitive/radius` |
| Shadows | 5 | `primitive/shadow` |
| Border Width | 4 | `primitive/border-width` |
| Duration | 5 | `primitive/motion` |
| Opacity | 4 | `primitive/opacity` |
| Semantic Colors (dark) | 31 | `semantic/dark` |
| Semantic Colors (light) | 31 | `semantic/light` |
| **Total** | **152** | **10 sets** |

## Sync Flow

```
Figma (Tokens Studio)
    ↕ GitHub Sync
tokens/tokens.json
    ↕ sync scripts
constants/theme.ts → tailwind.config.js → components
```

## Design Principles

1. **Clarity** — Interface serves content. Hierarchy through light/shadow, not decoration.
2. **Restraint** — High density, low noise. Reduce visible design decisions.
3. **Warmth** — Precision without coldness. Slightly thicker weight, warmer tones, softer corners.

## License

Private — Zettlab / Infist
