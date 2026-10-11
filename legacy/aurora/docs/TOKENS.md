# Design Tokens - Aurora Design System

> Valores centralizados de design para garantir consistência

## 🎨 Cores

### Primary Palette

Paleta principal do Aurora, baseada em tons terrosos e quentes.

```typescript
import { colors } from '@lumina/aurora/tokens';

colors.primary[50]  // #fdf8f6 - Cream (mais claro)
colors.primary[100] // #f2e8e5
colors.primary[200] // #eaddd7
colors.primary[300] // #e0cec7
colors.primary[400] // #d2bab0
colors.primary[500] // #bfa094
colors.primary[600] // #a18072
colors.primary[700] // #977669
colors.primary[800] // #846358
colors.primary[900] // #43302b - Café/Espresso (mais escuro)
```

**Uso:**
- 900: Textos principais, botões primários
- 600-800: Textos secundários, ícones
- 100-300: Backgrounds, borders
- 50: Background geral

### Accent Colors

Cores de destaque para elementos especiais.

```typescript
colors.accent.rose      // #f4dada - Blush
colors.accent.sage      // #e2e8e4 - Sage
colors.accent.lavender  // #e8e2f4 - Lavender
colors.accent.gold      // #d4af37 - Gold
```

**Uso:**
- Rose: Botões secundários, highlights, hover states
- Sage: Success states, natureza
- Lavender: Informações especiais
- Gold: Premium features, badges especiais

### Semantic Colors

Cores para feedback e estados.

```typescript
colors.semantic.success  // #10b981 - Verde
colors.semantic.warning  // #f59e0b - Amarelo
colors.semantic.error    // #ef4444 - Vermelho
colors.semantic.info     // #3b82f6 - Azul
```

**Uso:**
- Success: Operações bem-sucedidas, confirmações
- Warning: Avisos, atenção necessária
- Error: Erros, validações falhas
- Info: Informações neutras, dicas

## 📝 Tipografia

### Font Families

```typescript
import { typography } from '@lumina/aurora/tokens';

typography.fonts.serif  // "Playfair Display", serif
typography.fonts.sans   // "Plus Jakarta Sans", sans-serif
```

**Uso:**
- Serif: Headings (h1, h2, h3), elementos elegantes
- Sans: Body text, UI elements, buttons

### Font Sizes

```typescript
typography.sizes.xs    // 0.75rem  (12px)
typography.sizes.sm    // 0.875rem (14px)
typography.sizes.base  // 1rem     (16px)
typography.sizes.lg    // 1.125rem (18px)
typography.sizes.xl    // 1.25rem  (20px)
typography.sizes['2xl'] // 1.5rem   (24px)
typography.sizes['3xl'] // 1.875rem (30px)
typography.sizes['4xl'] // 2.25rem  (36px)
typography.sizes['5xl'] // 3rem     (48px)
```

**Mapeamento de Componentes:**
- h1: 4xl-5xl
- h2: 2xl-3xl
- h3: xl-2xl
- body: base
- small: sm
- caption: xs

### Font Weights

```typescript
typography.weights.light     // 300
typography.weights.regular   // 400
typography.weights.medium    // 500
typography.weights.semibold  // 600
typography.weights.bold      // 700
```

**Uso:**
- Light: Textos decorativos
- Regular: Body text padrão
- Medium: Navegação, labels
- Semibold: Subheadings, ênfase
- Bold: Headings principais

## 📏 Espaçamento

Sistema de espaçamento em escala de 4px.

```typescript
import { spacing } from '@lumina/aurora/tokens';

spacing[0]  // 0
spacing[1]  // 0.25rem  (4px)
spacing[2]  // 0.5rem   (8px)
spacing[3]  // 0.75rem  (12px)
spacing[4]  // 1rem     (16px)
spacing[5]  // 1.25rem  (20px)
spacing[6]  // 1.5rem   (24px)
spacing[8]  // 2rem     (32px)
spacing[10] // 2.5rem   (40px)
spacing[12] // 3rem     (48px)
```

**Guidelines:**
- 2-3: Espaçamento interno pequeno (buttons, badges)
- 4-6: Espaçamento padrão (cards, forms)
- 8-12: Espaçamento entre seções

## 🔲 Border Radius

```typescript
import { borderRadius } from '@lumina/aurora/tokens';

borderRadius.none  // 0
borderRadius.sm    // 0.25rem  (4px)
borderRadius.md    // 0.5rem   (8px)
borderRadius.lg    // 0.75rem  (12px)
borderRadius.xl    // 1rem     (16px)
borderRadius['2xl'] // 1.5rem   (24px)
borderRadius.full  // 9999px
```

**Uso:**
- sm: Badges, tags pequenos
- md-lg: Inputs, buttons pequenos
- xl: Buttons padrão
- 2xl: Cards, modals
- full: Avatares, pills

## 📱 Breakpoints (Referência)

Para uso com Tailwind CSS:

```typescript
sm:   640px   // Tablet pequeno
md:   768px   // Tablet
lg:   1024px  // Desktop pequeno
xl:   1280px  // Desktop
2xl:  1536px  // Desktop grande
```

**Mobile First:**
```tsx
// Base: mobile
// sm: tablet pequeno+
// md: tablet+
// lg: desktop+

className="text-sm md:text-base lg:text-lg"
```

## 🎯 Como Usar

### Em Componentes

```tsx
import { colors, typography, spacing } from '@lumina/aurora/tokens';

// Inline styles (evitar quando possível)
<div style={{
  color: colors.primary[900],
  fontFamily: typography.fonts.sans,
  padding: spacing[4],
}}>

// Tailwind (preferido)
<div className="text-[#43302b] font-sans p-4">
```

### Em CSS/SCSS

```css
.custom-component {
  /* Usando variáveis CSS */
  --primary-900: #43302b;
  --spacing-4: 1rem;
  
  color: var(--primary-900);
  padding: var(--spacing-4);
}
```

### Em Styled Components (futuro)

```tsx
import styled from 'styled-components';
import { colors, spacing } from '@lumina/aurora/tokens';

const StyledCard = styled.div`
  background: ${colors.primary[50]};
  padding: ${spacing[6]};
  border-radius: 1.5rem;
`;
```

## 🔍 Exemplos Práticos

### Botão Primary

```tsx
<button className="
  bg-[#43302b]           /* colors.primary[900] */
  text-white
  px-6 py-2.5            /* spacing[6] spacing[2.5] */
  rounded-xl             /* borderRadius.xl */
  font-sans              /* typography.fonts.sans */
  text-base              /* typography.sizes.base */
  font-medium            /* typography.weights.medium */
">
  Click me
</button>
```

### Card

```tsx
<div className="
  bg-white
  border border-[#f2e8e5]  /* colors.primary[100] */
  rounded-2xl              /* borderRadius.2xl */
  p-6                      /* spacing[6] */
  shadow-sm
">
  Content
</div>
```

## 📋 Checklist de Uso

Ao criar um novo componente:

- [ ] Usar cores dos tokens (primary, accent, semantic)
- [ ] Usar font-family dos tokens (serif para headings, sans para UI)
- [ ] Usar spacing scale (múltiplos de 4px)
- [ ] Usar border-radius consistente
- [ ] Evitar valores hardcoded
- [ ] Documentar quais tokens foram usados

## 🎨 Tema Futuro (Roadmap)

Para suportar dark mode:

```typescript
export const darkColors = {
  primary: { /* versões dark */ },
  accent: { /* ajustadas para dark */ },
};
```

Implementação via CSS Variables:

```css
:root {
  --color-primary-900: #43302b;
}

[data-theme="dark"] {
  --color-primary-900: #f2e8e5;
}
```
