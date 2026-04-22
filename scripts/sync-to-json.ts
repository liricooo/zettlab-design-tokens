/**
 * sync-to-json.ts
 *
 * Reads constants/theme.ts primitive + semantic values and updates tokens/tokens.json.
 * Preserves $themes, $metadata, $description, $type, and non-color token sets.
 *
 * Usage: npx tsx scripts/sync-to-json.ts [--dry-run]
 */

import * as fs from 'fs'
import * as path from 'path'

const TOKENS_PATH = path.resolve(__dirname, '../tokens.json')
const THEME_PATH = path.resolve(__dirname, '../constants/theme.ts')
const DRY_RUN = process.argv.includes('--dry-run')

// ── Parse theme.ts values using regex (no TS compiler needed) ──

const themeContent = fs.readFileSync(THEME_PATH, 'utf-8')

function extractObject(name: string): Record<string, any> {
  // Match: const <name> = { ... } or const <name>: Type = { ... }
  const pattern = new RegExp(`const ${name}(?::\\s*\\w+)?\\s*=\\s*\\{`, 'g')
  const match = pattern.exec(themeContent)
  if (!match) throw new Error(`Could not find "const ${name}" in theme.ts`)

  const start = match.index + match[0].length - 1
  let depth = 1
  let i = start + 1
  while (depth > 0 && i < themeContent.length) {
    if (themeContent[i] === '{') depth++
    if (themeContent[i] === '}') depth--
    i++
  }

  const block = themeContent.slice(start, i)
  // Convert to evaluatable JS: replace primitives.xxx references with strings
  let evalBlock = block
    .replace(/primitives\.(\w+)\[(\d+)\]/g, '"__REF__$1.$2"')
    .replace(/primitives\.(\w+)\.(\w+)/g, '"__REF__$1.$2"')

  try {
    // Use Function to evaluate (safer than eval, no global scope)
    return new Function(`return ${evalBlock}`)()
  } catch (e) {
    throw new Error(`Failed to parse "${name}" block: ${e}`)
  }
}

// ── Extract primitives ──

const primitives = extractObject('primitives')

// Resolve __REF__ markers back to actual values
function resolveValue(val: string): string {
  if (typeof val === 'string' && val.startsWith('__REF__')) {
    const ref = val.slice(7) // remove __REF__
    const [family, step] = ref.split('.')
    return primitives[family]?.[step] ?? val
  }
  return val
}

// ── Read and update tokens.json ──

const tokensRaw = fs.readFileSync(TOKENS_PATH, 'utf-8')
const tokens = JSON.parse(tokensRaw)

let changeCount = 0

// Update primitive colors
function updatePrimitiveColors() {
  const colorSet = tokens['primitive/color']?.color
  if (!colorSet) return

  for (const [family, steps] of Object.entries(primitives)) {
    if (!colorSet[family]) continue
    for (const [step, value] of Object.entries(steps as Record<string, string>)) {
      if (colorSet[family][step] && colorSet[family][step].$value !== value) {
        console.log(`  primitive/color > color.${family}.${step}: ${colorSet[family][step].$value} → ${value}`)
        colorSet[family][step].$value = value
        changeCount++
      }
    }
  }
}

// Update semantic mode
function updateSemanticMode(setName: string, tsObject: Record<string, string>) {
  const modeSet = tokens[setName]
  if (!modeSet) return

  const keyMap: Record<string, [string, string]> = {
    bgPage: ['bg', 'page'], bgSurface1: ['bg', 'surface1'], bgSurface2: ['bg', 'surface2'],
    bgSurface3: ['bg', 'surface3'], bgSurface4: ['bg', 'surface4'], bgBrand: ['bg', 'brand'],
    bgBrandHover: ['bg', 'brandHover'], bgBrandMuted: ['bg', 'brandMuted'], bgOverlay: ['bg', 'overlay'],
    textPrimary: ['text', 'primary'], textSecondary: ['text', 'secondary'],
    textTertiary: ['text', 'tertiary'], textQuaternary: ['text', 'quaternary'],
    textBrand: ['text', 'brand'], textOnBrand: ['text', 'onBrand'],
    textSuccess: ['text', 'success'], textWarning: ['text', 'warning'],
    textError: ['text', 'error'], textInfo: ['text', 'info'],
    borderSubtle: ['border', 'subtle'], borderDefault: ['border', 'default'],
    borderStrong: ['border', 'strong'], borderBrand: ['border', 'brand'],
    statusSuccess: ['status', 'success'], statusSuccessBg: ['status', 'successBg'],
    statusWarning: ['status', 'warning'], statusWarningBg: ['status', 'warningBg'],
    statusError: ['status', 'error'], statusErrorBg: ['status', 'errorBg'],
    statusInfo: ['status', 'info'], statusInfoBg: ['status', 'infoBg'],
  }

  for (const [tsKey, [category, jsonKey]] of Object.entries(keyMap)) {
    const resolvedValue = resolveValue(tsObject[tsKey])
    if (!resolvedValue) continue

    const token = modeSet[category]?.[jsonKey]
    if (!token) continue

    // Check if value changed — need to compare resolved values
    // For references, find the matching primitive ref
    const primRef = findPrimitiveRef(resolvedValue)
    const newValue = primRef ? `{color.${primRef}}` : resolvedValue

    if (token.$value !== newValue) {
      console.log(`  ${setName} > ${category}.${jsonKey}: ${token.$value} → ${newValue}`)
      token.$value = newValue
      changeCount++
    }
  }
}

function findPrimitiveRef(value: string): string | null {
  for (const [family, steps] of Object.entries(primitives)) {
    for (const [step, hex] of Object.entries(steps as Record<string, string>)) {
      if (hex === value) return `${family}.${step}`
    }
  }
  return null
}

// ── Run updates ──

console.log('Syncing theme.ts → tokens.json...\n')

updatePrimitiveColors()

const dark = extractObject('dark')
const light = extractObject('light')

// Resolve all __REF__ values
for (const key of Object.keys(dark)) dark[key] = resolveValue(dark[key])
for (const key of Object.keys(light)) light[key] = resolveValue(light[key])

updateSemanticMode('semantic/dark', dark)
updateSemanticMode('semantic/light', light)

if (changeCount === 0) {
  console.log('tokens.json is already in sync with theme.ts')
} else if (DRY_RUN) {
  console.log(`\n${changeCount} changes detected. Run without --dry-run to apply.`)
} else {
  const newJson = JSON.stringify(tokens, null, 2) + '\n'
  fs.writeFileSync(TOKENS_PATH, newJson, 'utf-8')
  console.log(`\ntokens.json updated (${changeCount} changes)`)
}
