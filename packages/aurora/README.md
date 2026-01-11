# Aurora Design System

> Sistema de design completo e componentizado para aplicações modernas

## 🎨 Visão Geral

O **Aurora Design System** é uma biblioteca de componentes React construída com TypeScript, focada em fornecer uma experiência de desenvolvimento consistente e de alta qualidade.

### Características

- ✅ Componentes React modernos e reutilizáveis
- ✅ TypeScript com type safety completo
- ✅ Design tokens centralizados
- ✅ Documentação via Storybook
- ✅ Distribuído como pacote npm
- ✅ Tree-shakeable e otimizado

## 📦 Instalação

```bash
# No seu projeto
npm install @lumina/aurora
```

## 🚀 Quick Start

```tsx
import { Button, Card, Typography } from '@lumina/aurora';

function App() {
  return (
    <Card padding="lg">
      <Typography variant="h2">Bem-vindo ao Aurora</Typography>
      <Typography variant="body">
        Sistema de design completo e profissional.
      </Typography>
      <Button variant="primary">Começar</Button>
    </Card>
  );
}
```

## 📚 Componentes

### Button

Botão com múltiplas variantes e estados.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- `fullWidth`: boolean
- `leftIcon`, `rightIcon`: ReactNode

**Exemplo:**
```tsx
<Button variant="primary" size="md">
  Clique aqui
</Button>

<Button variant="secondary" isLoading>
  Carregando...
</Button>
```

### Card

Container estilizado com padding configurável.

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `hover`: boolean

**Exemplo:**
```tsx
<Card padding="lg" hover>
  <Typography variant="h3">Título</Typography>
  <Typography variant="body">Conteúdo do card.</Typography>
</Card>
```

### Typography

Componente de texto com variantes semânticas.

**Props:**
- `variant`: 'h1' | 'h2' | 'h3' | 'body' | 'small'
- `as`: React.ElementType (opcional)

**Exemplo:**
```tsx
<Typography variant="h1">Título Principal</Typography>
<Typography variant="body">Texto do corpo.</Typography>
<Typography variant="small">Texto pequeno.</Typography>
```

## 🎨 Design Tokens

### Cores

```typescript
import { colors } from '@lumina/aurora/tokens';

colors.primary[900]    // #43302b - Café/Espresso
colors.primary[50]     // #fdf8f6 - Cream
colors.accent.rose     // #f4dada - Blush
colors.accent.sage     // #e2e8e4 - Sage
```

### Tipografia

```typescript
import { typography } from '@lumina/aurora/tokens';

typography.fonts.serif  // "Playfair Display", serif
typography.fonts.sans   // "Plus Jakarta Sans", sans-serif
typography.sizes.base   // 1rem (16px)
typography.sizes['4xl'] // 2.25rem (36px)
```

### Espaçamento

```typescript
import { spacing } from '@lumina/aurora/tokens';

spacing[4]   // 1rem (16px)
spacing[8]   // 2rem (32px)
spacing[12]  // 3rem (48px)
```

## 🛠 Desenvolvimento

### Rodar Storybook

```bash
cd packages/aurora
npm run storybook
```

Acesse: http://localhost:6006

### Build da Library

```bash
npm run build
```

Gera arquivos em `dist/` prontos para publicação.

## 📖 Storybook

O Aurora inclui Storybook completo com:
- Todos os componentes documentados
- Props interativas
- Variantes e estados
- Exemplos de uso

## 🎯 Uso em Monorepo

Este design system foi projetado para ser usado em um monorepo:

```json
{
  "workspaces": ["packages/*"]
}
```

No seu app:

```tsx
import { Button } from '@lumina/aurora';
```

## 📋 Boas Práticas

1. **Use Design Tokens** ao invés de valores hardcoded
2. **Importe componentes nominalmente** para tree-shaking
3. **Siga as variantes** definidas em cada componente
4. **Consulte o Storybook** para ver todos os estados
5. **Use TypeScript** para aproveitar a type safety

## 🔗 Links

- [Storybook](http://localhost:6006)
- [Component Spec](./COMPONENT_SPEC.md)
- [Design Tokens](./TOKENS.md)
- [Contributing](./CONTRIBUTING.md)

## 📄 Licença

Parte do projeto Lumina
