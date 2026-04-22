# Zettlab — Component Specifications

> **Last updated:** 2026-04-22
>
> 组件级设计规范。Token 值见 `tokens/tokens.json`，品牌上下文见 `impeccable.md`。

---

## Button（6 变体）

```
共用：
- radius: radius.button (8px)
- transition: duration.fast (200ms)
- active: scale(0.97)
- focus: 2px bg.brand-muted ring
- 高度: sm 32px / md 40px / lg 48px
```

| 变体 | BG | Text | Hover | 用途 |
|---|---|---|---|---|
| **primary** | `bg.brand` | `text.on-brand` | `bg.brand-hover` | 主 CTA |
| **secondary** | `bg.surface-2` | `text.primary` | `bg.surface-3` | 次要 |
| **ghost** | transparent | `text.primary` | `bg.surface-2` | 极轻 |
| **destructive** | `status.error` | `#FFFFFF` | `color.red.700` | 破坏 |
| **icon** | `bg.surface-1` | `text.primary` | `bg.surface-2` | 纯图标 |
| **chip** | transparent | `text.secondary` | `bg.surface-2` | 筛选/标签 |

Padding：
- sm: 6px 10px
- md: 8px 14px
- lg: 10px 18px
- icon: 8px 全方向

---

## Card

```
标准卡片:
- surface: bg.surface-2
- border: border.default
- radius: radius.md (8px)
- padding: space.4 (16px)
- hover: bg.surface-3

Elevated 卡片（弹层/下拉）:
- surface: bg.surface-3
- border: border.default
- radius: radius.lg (12px)
- shadow: shadow.sm (浅色) / surface 阶梯 (深色)
```

---

## Input / Textarea

```
默认态:
- bg: bg.surface-2
- border: border.default
- radius: radius.md (8px)
- padding: 10px 14px
- text: type.body + text.primary
- placeholder: text.tertiary

Focus 态:
- bg: bg.surface-3
- border: border.brand
- outer-ring: 2px bg.brand-muted

Search 变体:
- radius: radius.lg (12px)
- left padding: 40px (留图标空间)
- icon: text.tertiary
```

---

## Pill / Badge

| 类型 | 样式 |
|---|---|
| **Neutral Pill** | transparent + `border.default` + `radius.full` + `type.caption` |
| **Brand Pill** | `bg.brand-muted` + `text.brand` + `radius.full` |
| **Status Pill** | `status.{type}-bg` + `status.{type}` 文字 + `radius.full` |
| **Subtle Badge** | `bg.surface-3` + `radius.sm` + `type.caption` + `text.primary` |

padding: 2px 10px / 2px 8px (subtle)

---

## Avatar

```
尺寸:
- xs: 20px  (列表内 inline)
- sm: 28px  (消息气泡头)
- md: 36px  (列表项)
- lg: 48px  (卡片标题)
- xl: 64px  (详情页)

人物:
- radius: radius.full (圆形)
- bg: 根据首字母 hash 到 color.warm.*
- text: type.caption + white

Agent:
- radius: radius.md (8px 方形)
- bg: bg.brand-muted
- text: text.brand + first char
- 可选 icon 替代 first char
```

---

## Message Bubble

```
User 气泡:
- bg: bg.brand-muted
- text: text.primary
- radius: 18px（除右下角 4px）
- padding: 12px 16px
- max-width: 80%

Agent 气泡:
- bg: bg.surface-2
- text: text.secondary
- radius: 18px（除左下角 4px）
- padding: 12px 16px
- max-width: 85%
```

---

## Tab Bar（底部导航）

```
容器:
- 高度: 56px + safe-area-bottom
- bg: bg.surface-1
- top-border: border.subtle

Tab 项:
- 激活: icon + label 用 text.brand
- 未激活: icon + label 用 text.tertiary
- label: type.caption (11px, weight 510)
- icon: 24px
- transition: duration.fast
```

---

## Panel Header

```
容器:
- 高度: 52px
- bg: bg.page
- bottom-border: border.subtle

布局:
- 左: icon button (back/close) - 44x44 触控区
- 中: type.title-3 居中 - 固定到最大一行省略
- 右: action button（可选）
- 左右 padding: space.4 (16px)
```

---

## List Item

```
默认:
- 高度: 最小 48px
- bg: transparent
- padding: 12px 16px
- 左: icon (text.tertiary, 20px)
- 中: title (type.body-emphasis) + sub (type.footnote, text.tertiary)
- 右: trailing action / chevron

Hover:
- bg: bg.surface-2

Active/Selected:
- bg: bg.brand-muted
- left-border: borderWidth.medium + border.brand（可选）
- title: text.brand

Disabled:
- opacity: opacity.disabled (0.4)
```

---

## Responsive Behavior

### 断点（移动为基准）

| 名称 | 宽度 | 说明 |
|---|---|---|
| `bp.sm` | <640px | 单列，默认场景 |
| `bp.md` | 640-1024px | 部分 panel 可并列 |
| `bp.lg` | >=1024px | 设计稿预览 / Hi-Fi 模式 |

### 触控目标（强制下限）

- 按钮最小高度 **44px**
- 图标按钮触控区最小 **44x44px**（视觉可 36px，透明 padding 补足）
- 列表项最小高度 **48px**
- Tab Bar tab 最小宽度 **64px**

### 响应式缩放

| 维度 | mobile | tablet | desktop |
|---|---|---|---|
| display 字号 | 34px | 40px | 48px |
| 页面 padding | 16px | 24px | 32px |
| 卡片网格 | 1 列 | 2 列 | 3 列 |

### Safe Area

- 底部 tab bar: `pb-safe`
- Modal sheet 底部操作区: `pb-safe`
- 顶部 header（notch / dynamic island）: `pt-safe`

### Reduced Motion

`prefers-reduced-motion: reduce` 下：
- 所有 transition 降为 0.01ms
- 动画只保留 1 次迭代

---

## Agent Prompt Guide

### 默认场景色值（深色模式）

```
page bg          #000000
card bg          #17181B  (bg.surface-2)
elevated bg      #222326  (bg.surface-3)
primary text     #F7F6F3  (text.primary)
body text        #C8C7C1  (text.secondary)
muted text       #82807A  (text.tertiary)
brand            #6366DE  (bg.brand)
brand hover      #7E7FEF  (bg.brand-hover)
brand muted bg   #2C2E58  (bg.brand-muted)
border default   rgba(255,255,255,0.08)
```

### 默认字体设定

```css
font-family: 'Inter Variable', ...;
font-feature-settings: "cv01", "ss03", "kern";
font-size: 15px;         /* body */
font-weight: 450;        /* body default */
line-height: 1.50;
```

### 迭代检查清单

- [ ] Inter Variable + `"cv01", "ss03"` 全局开启？
- [ ] body 字重是 450 不是 400？
- [ ] 只有 brand 是有彩色，其余全灰阶？
- [ ] 圆角只用 4 / 8 / 12 / 16 / full 五档？
- [ ] 间距只用 8px 网格的倍数？
- [ ] 深色背景上的 border 是 `rgba(255,255,255,0.08)` 半透明白？
- [ ] 标题加了负字距（-0.008 至 -0.024em）？
- [ ] primary text 不是纯白 / 纯黑？
- [ ] Agent avatar 是方圆角（`radius.md`）而非圆形？
- [ ] 触控目标 >= 44x44px？
