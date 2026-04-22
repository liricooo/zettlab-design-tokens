# Zettlab Design Token Sync — Spec

> **Status:** Draft · 2026-04-22
> **Branch:** `feat/theme`
> **Owner:** Ric

## 目标

让 Figma 和代码两端都能修改 design token，通过 GitHub 同步，保持一致性。

## 架构

```
Figma (Tokens Studio plugin)
    ↕ GitHub Sync (push/pull)
tokens/tokens.json          ← W3C DTCG 格式，共享 source of truth
    ↕ 构建脚本
constants/theme.ts          ← 代码侧消费
    ↓ getThemeVars() 注入 CSS 变量
tailwind.config.js          ← Tailwind class 读取 var(--color-*)
    ↓
组件 className="bg-brand text-primary"
```

## Token 范围

### 纳入 tokens.json 的（设计决策）

| 类别 | Token Set | 数量 | $type |
|---|---|---|---|
| 颜色原子 | `primitive/color` | 59 | `color` |
| 字号 | `primitive/typography` | 10 | `fontSizes` |
| 字重 | `primitive/typography` | 6 | `fontWeights` |
| 行高 | `primitive/typography` | 7 | `lineHeights` |
| 字距 | `primitive/typography` | 7 | `letterSpacing` |
| 字体家族 | `primitive/typography` | 2 | `fontFamilies` |
| 间距 | `primitive/spacing` | 13 | `spacing` |
| 圆角 | `primitive/radius` | 6 | `borderRadius` |
| 阴影 | `primitive/shadow` | 5 | `boxShadow` |
| 边框宽度 | `primitive/border-width` | 4 | `borderWidth` |
| 动效时长 | `primitive/motion` | 5 | `duration` |
| 透明度 | `primitive/opacity` | 4 | `number` |
| 语义颜色 (dark) | `semantic/dark` | 31 | `color` |
| 语义颜色 (light) | `semantic/light` | 31 | `color` |
| **合计** | **10 sets** | **152** | |

### 不纳入的（平台逻辑）

- 设备状态色（`statusColors`）— 硬件状态，不随主题切换
- 字体家族回退链 — 平台相关（iOS/Android 不同）
- 运行时函数（`getThemeVars`、`getColors`）— 纯代码逻辑
- Easing 曲线 — Tokens Studio 对 `cubicBezier` 支持有限，保留在 `theme.ts`

## tokens.json 格式

遵循 W3C DTCG + Tokens Studio 扩展：

```json
{
  "primitive/color": {
    "color": {
      "gray": {
        "0": { "$value": "#000000", "$type": "color", "$description": "..." }
      }
    }
  },
  "semantic/dark": {
    "bg": {
      "page": { "$value": "{color.gray.0}", "$type": "color", "$description": "..." }
    }
  },
  "$themes": [ ... ],
  "$metadata": { "tokenSetOrder": [ ... ] }
}
```

### 规则

1. 每个 token 必须有 `$value`、`$type`
2. `$description` 全小写，无末尾空格
3. Hex 颜色大写（`#6366DE`，非 `#6366de`）
4. Semantic 层只引用 Primitive（`{color.gray.900}`），不直接写 hex
5. `$themes` 和 `$metadata` 由 Tokens Studio 管理，手动编辑时只改 token 值
6. `semantic/dark` 和 `semantic/light` 必须定义完全相同的 token path 集合

## 同步流程

### Figma → 代码

1. 在 Figma 中通过 Tokens Studio 修改 token
2. Tokens Studio push 到 GitHub（`tokens/tokens.json` 更新）
3. 运行 `scripts/sync-to-code.ts`
4. 脚本读取 `tokens.json`，生成 `constants/theme.ts` 的 primitives + dark + light 对象
5. Review diff，commit

### 代码 → Figma

1. 在 `constants/theme.ts` 中修改 token 值
2. 运行 `scripts/sync-to-json.ts`
3. 脚本读取 `theme.ts`，更新 `tokens/tokens.json` 中对应的 `$value`
4. Commit push
5. Tokens Studio pull 回 Figma

### tailwind.config.js 不需要同步

它只写 `var(--color-bg-brand)` 引用，不存具体值。除非新增或删除 token，否则不需要改。

## Skills

### validate（检查 tokens.json 规范性）

检查项：
1. 引用是否断裂 — 所有 `{path}` 必须解析到已定义的 token
2. dark/light 对称 — 两个 mode 必须有相同的 token path
3. Hex 大写 — 不允许小写 hex
4. $type 齐全 — 每个有 `$value` 的节点必须有 `$type`
5. $description 格式 — 小写开头，无末尾空格
6. 无复合节点 — 一个节点要么是叶子（有 `$value`），要么是组（有子节点），不能两者兼有

### audit-code（检查代码硬编码）

检查项：
1. 硬编码色值 — 组件中直接写 `#xxx` 或 `rgba()` 而非用 token
2. 非体系字号 — `text-[14px]` 等不在 10 档内的值
3. 非体系字重 — `font-[500]` 等不在 6 档内的值
4. 非体系圆角 — `rounded-[6px]` 等不在 5 档内的值
5. 非体系间距 — `p-[7px]` 等不在 8px 网格内的值
6. 未使用 token — `SemanticColors` 中定义了但无组件引用的 token
7. tokens.json ↔ theme.ts 漂移 — 两边值不一致

### sync-to-code（JSON → theme.ts）

步骤：
1. 读取 `tokens/tokens.json`
2. 解析 `primitive/color` → 生成 `primitives` 对象
3. 解析 `semantic/dark` + `semantic/light` → 生成 `dark` / `light` 对象
4. 写入 `constants/theme.ts`（保留手动代码区域：motion、opacity、borderWidth、typography 等）
5. 展示 diff，确认后写入

### sync-to-json（theme.ts → JSON）

步骤：
1. 读取 `constants/theme.ts`
2. 提取 `primitives`、`dark`、`light` 对象的值
3. 更新 `tokens/tokens.json` 中对应 `$value`
4. 保留 `$themes`、`$metadata` 不变
5. 展示 diff，确认后写入

## 文件结构

```
tokens/
  tokens.json              ← W3C DTCG，Tokens Studio 兼容（已创建）
scripts/
  sync-to-code.ts          ← JSON → theme.ts（待实现）
  sync-to-json.ts          ← theme.ts → JSON（待实现）
skills/
  validate.md              ← tokens.json 规范检查（待实现）
  audit-code.md            ← 代码硬编码检查（待实现）
  sync-to-code.md          ← 同步操作指南（待实现）
  sync-to-json.md          ← 同步操作指南（待实现）
constants/
  theme.ts                 ← 代码侧 token 定义（已有）
tailwind.config.js         ← Tailwind 变量映射（已有）
docs/theme/
  impeccable.md            ← 品牌上下文 + 设计原则（保留）
  design.md                ← 设计系统规范 → 瘦身后保留架构规则、组件规范、Do's/Don'ts
  token-sync-spec.md       ← 本文档
```

## docs/theme/ 文档改造

### impeccable.md — 保留不变

品牌上下文、用户画像、设计原则（Clarity / Restraint / Warmth）、审美方向。tokens.json 无法表达这些。

### design.md — 瘦身

移除与 tokens.json 重复的色值表、字号表、间距表等，改为指向 `tokens/tokens.json` 作为值的 source of truth。保留：
- Section 1: Visual Theme（设计方向）
- Section 2: Token 架构（三层模型 + 命名约定）
- Section 8: Component Specifications（组件级规范）
- Section 9: Do's and Don'ts（使用纪律）
- Section 10: Responsive Behavior（断点、触控目标）
- Section 11: Agent Prompt Guide（AI 快速参考）

## 实施顺序

1. ~~创建 `tokens/tokens.json`~~ ✅ 已完成
2. ~~定义 motion/opacity/borderWidth token 并替换硬编码~~ ✅ 已完成
3. 实现 `scripts/sync-to-code.ts`
4. 实现 `scripts/sync-to-json.ts`
5. 编写 4 个 skill markdown
6. 瘦身 `design.md`
7. Tokens Studio 导入测试
