# Component Specification - Aurora Design System

> Especificação completa para criar novos componentes no Aurora

## 🎯 Template de Componente

Ao criar um novo componente, siga esta estrutura:

```tsx
import React from 'react';

export interface ComponentNameProps {
  // Props obrigatórias
  children: React.ReactNode;
  
  // Props opcionais com valores default
  variant?: 'default' | 'alternative';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  
  // Handlers
  onClick?: () => void;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  onClick,
}) => {
  // Estilos base (sempre aplicados)
  const baseStyles = 'font-sans transition-all duration-200';
  
  // Variantes de estilo
  const variants = {
    default: 'bg-white text-[#43302b]',
    alternative: 'bg-[#f4dada] text-[#43302b]',
  };
  
  // Tamanhos
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };
  
  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
```

## 📝 Checklist para Novos Componentes

### 1. Arquivo do Componente (`ComponentName.tsx`)

- [ ] Interface exportada com sufixo `Props`
- [ ] Props tipadas com TypeScript
- [ ] Valores default para props opcionais
- [ ] Uso de design tokens (cores hardcoded com valores do tokens)
- [ ] Suporte para `className` customizada
- [ ] Composição adequada de estilos

### 2. Story do Storybook (`ComponentName.stories.tsx`)

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'alternative'],
    },
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Content here',
  },
};

export const Alternative: Story = {
  args: {
    children: 'Alternative content',
    variant: 'alternative',
  },
};
```

Checklist da Story:
- [ ] Meta configurado corretamente
- [ ] `tags: ['autodocs']` para documentação automática
- [ ] Pelo menos 3 stories (Default, variantes principais)
- [ ] ArgTypes configurados para props dinâmicas

### 3. Exportação no Index (`src/index.ts`)

```tsx
export { ComponentName } from './components/ComponentName';
export type { ComponentNameProps } from './components/ComponentName';
```

- [ ] Componente exportado
- [ ] Type exportado separadamente

### 4. Documentação

- [ ] JSDoc comments no componente
- [ ] Exemplo de uso no README
- [ ] Props documentadas

## 🎨 Guidelines de Estilo

### Cores

Sempre use os valores dos design tokens:

```tsx
// ✅ CORRETO
className="bg-[#43302b] text-white"

// ❌ ERRADO
style={{ backgroundColor: '#000' }}
```

### Paleta Principal:
- Primary 900: `#43302b` (Café/Espresso)
- Primary 50: `#fdf8f6` (Cream)
- Accent Rose: `#f4dada` (Blush)
- Accent Sage: `#e2e8e4` (Sage)

### Classes Tailwind

Use classes do Tailwind sempre que possível:

```tsx
// ✅ CORRETO
className="px-4 py-2 rounded-xl transition-all"

// ❌ ERRADO  
style={{ padding: '8px 16px', borderRadius: '12px' }}
```

### Responsividade

Use prefixos do Tailwind:

```tsx
className="text-sm md:text-base lg:text-lg"
```

## 🔧 Props Patterns

### Children

```tsx
children: React.ReactNode  // Aceita qualquer conteúdo React
```

### Variantes

```tsx
variant?: 'primary' | 'secondary' | 'outline'  // String literal union
```

### Tamanhos

```tsx
size?: 'sm' | 'md' | 'lg'  // Consistente em todos os componentes
```

### Estados Booleanos

```tsx
isLoading?: boolean
isDisabled?: boolean
isActive?: boolean
```

### Callbacks

```tsx
onClick?: () => void
onChange?: (value: string) => void
onSubmit?: (data: FormData) => void
```

## 📦 Estrutura de Arquivos

```
src/components/
├── Button.tsx           # Componente
├── Button.stories.tsx   # Stories do Storybook
└── Button.test.tsx      # Testes (futuro)
```

## 🎯 Exemplos Completos

### Componente Simples (Badge)

```tsx
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
}) => {
  const variants = {
    default: 'bg-[#eaddd7] text-[#43302b]',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};
```

### Componente Composto (Modal)

```tsx
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        {title && (
          <div className="px-6 py-4 border-b border-[#f2e8e5]">
            <Typography variant="h3">{title}</Typography>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[#f2e8e5]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
```

## ✅ Review Checklist

Antes de fazer commit de um novo componente:

- [ ] TypeScript: Sem erros de tipo
- [ ] Props: Interface bem definida
- [ ] Styles: Usando design tokens
- [ ] Stories: Pelo menos 3 variantes
- [ ] Export: Adicionado ao index.ts
- [ ] Documentação: JSDoc e exemplo no README
- [ ] Acessibilidade: ARIA labels quando necessário
- [ ] Responsivo: Testado em mobile/desktop

## 🚀 Próximos Passos

Após criar o componente:

1. Rodar Storybook localmente
2. Testar todas as variantes
3. Adicionar ao README principal
4. Fazer commit com mensagem descritiva
5. Atualizar CHANGELOG.md
