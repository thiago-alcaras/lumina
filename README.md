
# Lumina: The Digital Sanctuary + Aurora Design System

> Monorepo completo com aplicação web e design system independente

## 🏗️ Estrutura do Monorepo

Este projeto usa npm workspaces para gerenciar múltiplos pacotes:

```text
/
├── packages/
│   ├── lumina/          # Aplicação web (Vite + React)
│   │   ├── src/
│   │   │   ├── features/        # Dashboard, Journal, VisionBoard, etc.
│   │   │   ├── services/        # geminiService, persistenceService
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── aurora/          # Design System (componentes React + Storybook)
│       ├── src/
│       │   ├── tokens/          # Colors, typography, spacing
│       │   ├── components/      # Button, Card, Typography, etc.
│       │   └── index.ts
│       ├── docs/                # Documentação .md para IA
│       │   ├── README.md
│       │   ├── COMPONENT_SPEC.md
│       │   ├── TOKENS.md
│       │   ├── USAGE.md
│       │   └── CONTRIBUTING.md
│       ├── .storybook/          # Configuração do Storybook
│       ├── package.json
│       └── vite.config.ts
│
├── package.json         # Root com workspaces
└── README.md            # Este arquivo
```

## 🚀 Quick Start

### Instalar Dependências

```bash
npm install
```

### Rodar Lumina (Aplicação Web)

```bash
npm run dev:lumina
# Acesse: http://localhost:3000
```

### Rodar Aurora (Storybook)

```bash
npm run dev:aurora
# Acesse: http://localhost:6006
```

### Rodar Ambos

```bash
# Terminal 1
npm run dev:lumina

# Terminal 2
npm run dev:aurora
```

## 📦 Pacotes

### Lumina (Web App)

Aplicação de planejamento pessoal com IA para organização e manifestação.

**Features:**
- 📊 Dashboard com insights AI (Gemini)
- 📅 CalendarView (mensal/semanal)
- 👗 Style Registry (lookbook visual)
- 🎨 Vision Board (geração de imagens AI)
- ✍️ Daily Glow Journal (reflexões)

**Tech Stack:**
- React 19
- TypeScript 5.8
- Vite 6
- Tailwind CSS (CDN)
- Gemini API
- LocalStorage persistence

### Aurora (Design System)

Sistema de design componentizado e independente.

**Componentes:**
- Button (4 variantes, 3 tamanhos, loading state)
- Card (padding configurável, hover)
- Typography (h1, h2, h3, body, small)

**Features:**
- 🎨 Design tokens centralizados
- 📚 Storybook completo
- 📖 Documentação .md para IA
- 🔧 TypeScript type-safe
- 📦 Distribuível como biblioteca

**Tech Stack:**
- React 19
- TypeScript 5.8
- Vite 6 (library mode)
- Storybook 8.5
- Tailwind CSS

## 🎨 Design System: Aurora

### Colors

```typescript
// Primary Palette
colors.primary[900] // #43302b - Café/Espresso
colors.primary[50]  // #fdf8f6 - Cream

// Accent Colors
colors.accent.rose  // #f4dada - Blush
colors.accent.sage  // #e2e8e4 - Sage
colors.accent.gold  // #d4af37 - Gold
```

### Typography

```typescript
typography.fonts.serif  // "Playfair Display" - Headings
typography.fonts.sans   // "Plus Jakarta Sans" - UI
```

## 🛠 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev:lumina    # Roda aplicação Lumina
npm run dev:aurora    # Roda Storybook do Aurora
```

### Build

```bash
npm run build:lumina  # Build da aplicação
npm run build:aurora  # Build da biblioteca Aurora
```

### Storybook

```bash
npm run storybook     # Inicia Storybook
npm run build-storybook  # Build estático do Storybook
```

## 📚 Documentação

### Aurora Design System

- [README](./packages/aurora/README.md) - Visão geral e quick start
- [Component Spec](./packages/aurora/docs/COMPONENT_SPEC.md) - Criar componentes
- [Design Tokens](./packages/aurora/docs/TOKENS.md) - Cores, tipografia, espaçamento
- [Usage Guide](./packages/aurora/docs/USAGE.md) - Como usar os componentes
- [Contributing](./packages/aurora/docs/CONTRIBUTING.md) - Guia de contribuição

### Lumina App

- Features modulares em `packages/lumina/src/features/`
- Services em `packages/lumina/src/services/`
- Tipos em `packages/lumina/src/types.ts`

## 🔧 Setup de Desenvolvimento

### Pré-requisitos

- Node.js 18+ (recomendado: 20+)
- npm 9+

### Variáveis de Ambiente

Crie `.env` na raiz:

```bash
GEMINI_API_KEY=sua_chave_aqui
```

### Estrutura de Desenvolvimento

1. **Desenvolver componentes no Aurora:**
   ```bash
   cd packages/aurora
   npm run storybook
   ```

2. **Usar componentes no Lumina:**
   ```tsx
   import { Button, Card } from '@lumina/aurora';
   ```

3. **Hot reload automático:**
   - Mudanças no Aurora refletem automaticamente no Lumina
   - Workspaces permitem desenvolvimento integrado

## 🎯 Workflow de Desenvolvimento

### Adicionar Componente no Aurora

1. Criar `packages/aurora/src/components/NovoComponente.tsx`
2. Criar `packages/aurora/src/components/NovoComponente.stories.tsx`
3. Exportar em `packages/aurora/src/index.ts`
4. Testar no Storybook
5. Usar no Lumina

### Adicionar Feature no Lumina

1. Criar `packages/lumina/src/features/NovaFeature.tsx`
2. Importar componentes do Aurora
3. Adicionar rota/lógica no `App.tsx`
4. Testar no navegador

## 📋 Boas Práticas

### Commits

Use conventional commits:
```
feat: adiciona componente Badge
fix: corrige hover do Button
docs: atualiza README do Aurora
```

### Imports

```tsx
// ✅ Bom - Aurora
import { Button, Card } from '@lumina/aurora';

// ✅ Bom - Lumina
import { Dashboard } from './features/Dashboard';
```

## 🐛 Troubleshooting

### Problema: Aurora não encontrado

```bash
npm install
```

### Problema: Port em uso

```bash
# Lumina usa porta 3000
# Storybook usa porta 6006
# Verifique se estão livres
```

### Problema: TypeScript errors

```bash
cd packages/aurora
npm run build
```

## 📄 Licença

Projeto Lumina - Design System Aurora
