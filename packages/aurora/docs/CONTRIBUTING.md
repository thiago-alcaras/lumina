# Contributing to Aurora Design System

> Guia para contribuir com o Aurora

## 🎯 Como Contribuir

### Reportar Bugs

Ao reportar um bug, inclua:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Versão do Aurora e React

### Sugerir Features

Para sugerir novos componentes ou features:
- Descreva o caso de uso
- Exemplos visuais ou referências
- Como isso beneficia o sistema

## 🛠 Setup de Desenvolvimento

### 1. Clone o Repositório

```bash
git clone <repo-url>
cd lumina
```

### 2. Instale Dependências

```bash
npm install
```

### 3. Rode o Storybook

```bash
cd packages/aurora
npm run storybook
```

Acesse: http://localhost:6006

## 📝 Criando um Novo Componente

### Workflow

1. **Planeje o componente**
   - Defina props e variantes
   - Consulte [COMPONENT_SPEC.md](./COMPONENT_SPEC.md)

2. **Crie o arquivo do componente**
   ```bash
   packages/aurora/src/components/NomeComponente.tsx
   ```

3. **Implemente o componente**
   - Use TypeScript
   - Siga os design tokens
   - Adicione JSDoc

4. **Crie a Story**
   ```bash
   packages/aurora/src/components/NomeComponente.stories.tsx
   ```

5. **Exporte no index**
   ```tsx
   // packages/aurora/src/index.ts
   export { NomeComponente } from './components/NomeComponente';
   export type { NomeComponenteProps } from './components/NomeComponente';
   ```

6. **Teste no Storybook**
   ```bash
   npm run storybook
   ```

7. **Documente**
   - Adicione exemplo no README.md
   - Atualize USAGE.md se necessário

### Exemplo Completo: Criando Badge

```tsx
// src/components/Badge.tsx
import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
}) => {
  const variants = {
    default: 'bg-[#eaddd7] text-[#43302b]',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};
```

```tsx
// src/components/Badge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: 'Error',
    variant: 'error',
  },
};
```

## 🎨 Guidelines de Código

### TypeScript

- Sempre tipear props
- Exportar interfaces
- Usar tipos ao invés de any

```tsx
// ✅ Bom
export interface ComponentProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

// ❌ Evitar
function Component(props: any) { }
```

### Naming

- PascalCase para componentes e interfaces
- camelCase para funções e variáveis
- kebab-case para arquivos CSS

```tsx
// ✅ Bom
export const MyComponent: React.FC<MyComponentProps>

// ❌ Evitar
export const myComponent: React.FC<myComponentProps>
```

### Props

- Use destructuring
- Defina defaults
- Documente props complexas

```tsx
// ✅ Bom
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  // ...
};

// ❌ Evitar
export const Button = (props) => {
  return <button>{props.children}</button>;
};
```

### Estilos

- Use Tailwind classes
- Referencie design tokens
- Evite inline styles

```tsx
// ✅ Bom
<button className="bg-[#43302b] px-6 py-2.5 rounded-xl">

// ❌ Evitar
<button style={{ background: '#000', padding: '10px' }}>
```

## 🧪 Testes (Futuro)

Planejado para futuras versões:

```bash
npm test
```

Estrutura de teste:

```tsx
// Badge.test.tsx
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge).toHaveClass('bg-green-100');
  });
});
```

## 📦 Build & Release

### Build Local

```bash
npm run build
```

Gera arquivos em `dist/`:
- `dist/index.js` (ESM)
- `dist/index.cjs` (CommonJS)
- `dist/index.d.ts` (TypeScript definitions)

### Verificar Build

```bash
# Limpar e rebuildar
npm run build

# Verificar arquivos gerados
ls -la dist/
```

## ✅ Checklist de PR

Antes de submeter um Pull Request:

- [ ] Código segue os style guidelines
- [ ] TypeScript sem erros (`npm run build`)
- [ ] Storybook funciona (`npm run storybook`)
- [ ] Componente exportado em `src/index.ts`
- [ ] Props documentadas com JSDoc
- [ ] Stories criadas com múltiplas variantes
- [ ] README atualizado com exemplo
- [ ] Commit messages claras e descritivas

## 📋 Commit Messages

Use conventional commits:

```
feat: adiciona componente Badge
fix: corrige hover state do Button
docs: atualiza README com exemplos
chore: atualiza dependências
```

Tipos:
- `feat`: Nova feature
- `fix`: Bug fix
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração de código
- `test`: Testes
- `chore`: Manutenção

## 🤝 Code Review

Ao revisar PRs, verifique:

1. **Funcionalidade**
   - Componente funciona como esperado?
   - Todas as variantes testadas?

2. **Código**
   - Segue os guidelines?
   - TypeScript correto?
   - Sem código duplicado?

3. **Documentação**
   - Stories completas?
   - Props documentadas?
   - README atualizado?

4. **Performance**
   - Bundle size aceitável?
   - Sem re-renders desnecessários?

## 🎯 Roadmap

Próximas features planejadas:

### Componentes
- [ ] Input / TextField
- [ ] Select / Dropdown
- [ ] Modal / Dialog
- [ ] Avatar
- [ ] Badge
- [ ] Tooltip
- [ ] Tabs
- [ ] Accordion

### Infraestrutura
- [ ] Testes unitários (Vitest)
- [ ] Testes E2E (Playwright)
- [ ] CI/CD pipeline
- [ ] Publicação no npm
- [ ] Versioning semântico

### Features
- [ ] Dark mode support
- [ ] Animações
- [ ] Acessibilidade ARIA
- [ ] i18n support

## 💬 Comunicação

- Para dúvidas: Abra uma issue
- Para discussões: Use discussions no GitHub
- Para bugs urgentes: Marque como priority

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.
