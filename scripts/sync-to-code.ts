/**
 * sync-to-code.ts
 *
 * Reads tokens/tokens.json and generates constants/theme.ts primitives + dark + light.
 * Preserves hand-written sections (motion, opacity, borderWidth, typography, etc.).
 *
 * Usage: npx tsx scripts/sync-to-code.ts [--dry-run]
 */

import * as fs from 'fs'
import * as path from 'path'

const TOKENS_PATH = path.resolve(__dirname, '../tokens.json')
const THEME_PATH = path.resolve(__dirname, '../constants/theme.ts')
const DRY_RUN = process.argv.includes('--dry-run')

// ── Read tokens.json ──

const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'))

// ── Extract primitive colors ──

function extractPrimitiveColors(): Record<string, Record<string, string>> {
  const colorSet = tokens['primitive/color']?.color
  if (!colorSet) throw new Error('primitive/color not found in tokens.json')

  const result: Record<string, Record<string, string>> = {}
  for (const [family, steps] of Object.entries(colorSet)) {
    result[family] = {}
    for (const [step, token] of Object.entries(steps as Record<string, any>)) {
      result[family][step] = token.$value
    }
  }
  return result
}

// ── Resolve references ──

function resolveRef(value: string, primitiveColors: Record<string, Record<string, string>>): string {
  const match = value.match(/^\{color\.(\w+)\.(\w+)\}$/)
  if (match) {
    const [, family, step] = match
    return primitiveColors[family]?.[step] ?? value
  }
  return value
}

// ── Extract semantic colors for a mode ──

function extractSemanticMode(
  setName: string,
  primitiveColors: Record<string, Record<string, string>>
): Record<string, string> {
  const modeSet = tokens[setName]
  if (!modeSet) throw new Error(`${setName} not found in tokens.json`)

  const result: Record<string, string> = {}

  const keyMap: Record<string, Record<string, string>> = {
    bg: {
      page: 'bgPage', surface1: 'bgSurface1', surface2: 'bgSurface2',
      surface3: 'bgSurface3', surface4: 'bgSurface4', brand: 'bgBrand',
      brandHover: 'bgBrandHover', brandMuted: 'bgBrandMuted', overlay: 'bgOverlay',
    },
    text: {
      primary: 'textPrimary', secondary: 'textSecondary', tertiary: 'textTertiary',
      quaternary: 'textQuaternary', brand: 'textBrand', onBrand: 'textOnBrand',
      success: 'textSuccess', warning: 'textWarning', error: 'textError', info: 'textInfo',
    },
    border: {
      subtle: 'borderSubtle', default: 'borderDefault',
      strong: 'borderStrong', brand: 'borderBrand',
    },
    status: {
      success: 'statusSuccess', successBg: 'statusSuccessBg',
      warning: 'statusWarning', warningBg: 'statusWarningBg',
      error: 'statusError', errorBg: 'statusErrorBg',
      info: 'statusInfo', infoBg: 'statusInfoBg',
    },
  }

  for (const [category, keys] of Object.entries(keyMap)) {
    for (const [jsonKey, tsKey] of Object.entries(keys)) {
      const token = modeSet[category]?.[jsonKey]
      if (!token) {
        console.warn(`WARN: ${setName} > ${category}.${jsonKey} missing`)
        continue
      }
      result[tsKey] = resolveRef(token.$value, primitiveColors)
    }
  }

  return result
}

// ── Generate theme.ts content ──

function generatePrimitivesBlock(colors: Record<string, Record<string, string>>): string {
  const lines: string[] = ['const primitives = {']

  // Families that use short one-line format (<=4 entries)
  const shortFamilies = ['green', 'amber', 'red', 'blue']

  for (const [family, steps] of Object.entries(colors)) {
    const entries = Object.entries(steps)

    if (shortFamilies.includes(family) || entries.length <= 4) {
      // Compact format: { 50: '#xxx', 500: '#xxx' }
      const maxKeyLen = Math.max(...entries.map(([k]) => k.length))
      const pairs = entries.map(([k, v]) => {
        const key = /^\d/.test(k) ? k : `'${k}'`
        return `${key}: '${v}'`
      }).join(', ')
      // Pad family name for alignment
      const pad = family.length < 6 ? ' '.repeat(6 - family.length) : ''
      lines.push(`  ${family}:${pad} { ${pairs} },`)
    } else if (family === 'white' || family === 'black') {
      // Alpha families with string keys
      lines.push(`  ${family}: {`)
      for (const [step, value] of entries) {
        lines.push(`    ${step}: '${value}',`)
      }
      lines.push('  },')
    } else {
      // Full families
      lines.push(`  ${family}: {`)
      for (const [step, value] of entries) {
        const key = /^\d/.test(step) ? step : step
        lines.push(`    ${key}: '${value}',`)
      }
      lines.push('  },')
    }
  }
  lines.push('}')
  return lines.join('\n')
}

function generateSemanticBlock(name: string, values: Record<string, string>, colors: Record<string, Record<string, string>>): string {
  const lines: string[] = [`const ${name}: SemanticColors = {`]

  // Group by prefix
  const groups: Record<string, [string, string][]> = {}
  for (const [key, value] of Object.entries(values)) {
    const prefix = key.replace(/[A-Z].*/, '')
    if (!groups[prefix]) groups[prefix] = []

    // Try to express as primitives.xxx reference
    const ref = findPrimitiveRef(value, colors)
    groups[prefix].push([key, ref ?? `'${value}'`])
  }

  for (const [, entries] of Object.entries(groups)) {
    for (const [key, expr] of entries) {
      lines.push(`  ${key}: ${expr},`)
    }
    lines.push('')
  }

  // Remove trailing empty line
  if (lines[lines.length - 1] === '') lines.pop()
  lines.push('}')
  return lines.join('\n')
}

function findPrimitiveRef(value: string, colors: Record<string, Record<string, string>>): string | null {
  for (const [family, steps] of Object.entries(colors)) {
    for (const [step, hex] of Object.entries(steps)) {
      if (hex === value) {
        const key = /^\d/.test(step) ? `[${step}]` : `.${step}`
        return `primitives.${family}${key}`
      }
    }
  }
  return null
}

// ── Main ──

const primitiveColors = extractPrimitiveColors()
const darkValues = extractSemanticMode('semantic/dark', primitiveColors)
const lightValues = extractSemanticMode('semantic/light', primitiveColors)

// Read existing theme.ts
const existingContent = fs.readFileSync(THEME_PATH, 'utf-8')

// Replace primitives block
const primBlock = generatePrimitivesBlock(primitiveColors)
const darkBlock = generateSemanticBlock('dark', darkValues, primitiveColors)
const lightBlock = generateSemanticBlock('light', lightValues, primitiveColors)

// Build new content by replacing sections
let newContent = existingContent

// Replace primitives
newContent = newContent.replace(
  /const primitives = \{[\s\S]*?\n\}/,
  primBlock
)

// Replace dark
newContent = newContent.replace(
  /const dark: SemanticColors = \{[\s\S]*?\n\}/,
  darkBlock
)

// Replace light
newContent = newContent.replace(
  /const light: SemanticColors = \{[\s\S]*?\n\}/,
  lightBlock
)

if (DRY_RUN) {
  // Show diff
  if (newContent === existingContent) {
    console.log('No changes detected.')
  } else {
    console.log('Changes detected. Run without --dry-run to apply.')
    // Simple line diff
    const oldLines = existingContent.split('\n')
    const newLines = newContent.split('\n')
    const maxLen = Math.max(oldLines.length, newLines.length)
    let diffCount = 0
    for (let i = 0; i < maxLen; i++) {
      if (oldLines[i] !== newLines[i]) {
        diffCount++
        if (diffCount <= 20) {
          console.log(`  L${i + 1}:`)
          if (oldLines[i]) console.log(`    - ${oldLines[i]}`)
          if (newLines[i]) console.log(`    + ${newLines[i]}`)
        }
      }
    }
    if (diffCount > 20) console.log(`  ... and ${diffCount - 20} more changes`)
    console.log(`\nTotal: ${diffCount} lines changed`)
  }
} else {
  if (newContent === existingContent) {
    console.log('theme.ts is already in sync with tokens.json')
  } else {
    fs.writeFileSync(THEME_PATH, newContent, 'utf-8')
    console.log('theme.ts updated from tokens.json')
  }
}
