# Guia de Uso - Aurora Design System

> Como integrar e usar o Aurora nos seus projetos

## 🚀 Instalação

### Em um Monorepo (Recomendado)

Se você está usando npm workspaces (como no projeto Lumina):

```json
{
  "dependencies": {
    "@lumina/aurora": "workspace:*"
  }
}
```

Depois rode:

```bash
npm install
```

### Como Pacote Standalone

```bash
npm install @lumina/aurora
```

## 📦 Importações

### Componentes

```tsx
// Importação nomeada (tree-shaking)
import { Button, Card, Typography } from '@lumina/aurora';

// Importação individual (alternativa)
import { Button } from '@lumina/aurora/Button';
```

### Design Tokens

```tsx
import { colors, typography, spacing, borderRadius } from '@lumina/aurora/tokens';

// Usar em estilos inline
<div style={{ color: colors.primary[900] }} />

// Usar em Tailwind classes
<div className="text-[#43302b]" />
```

### Tipos TypeScript

```tsx
import type { ButtonProps, CardProps, TypographyProps } from '@lumina/aurora';

// Estender props
interface CustomButtonProps extends ButtonProps {
  customProp: string;
}
```

## 🎯 Exemplos de Uso

### Botões

```tsx
import { Button } from '@lumina/aurora';

function MyComponent() {
  return (
    <>
      {/* Botão primário básico */}
      <Button variant="primary" onClick={() => console.log('clicked')}>
        Salvar
      </Button>

      {/* Botão com loading */}
      <Button variant="primary" isLoading>
        Processando...
      </Button>

      {/* Botão com ícone */}
      <Button 
        variant="secondary" 
        leftIcon={<Icon name="plus" />}
      >
        Adicionar
      </Button>

      {/* Botão outline tamanho grande */}
      <Button variant="outline" size="lg">
        Ver Detalhes
      </Button>

      {/* Botão full width */}
      <Button variant="primary" fullWidth>
        Continuar
      </Button>
    </>
  );
}
```

### Cards

```tsx
import { Card, Typography } from '@lumina/aurora';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card padding="lg" hover>
        <Typography variant="h3">Total de Vendas</Typography>
        <Typography variant="body">R$ 125.000,00</Typography>
      </Card>

      <Card padding="lg" hover>
        <Typography variant="h3">Clientes Ativos</Typography>
        <Typography variant="body">1.234</Typography>
      </Card>

      <Card padding="lg" hover>
        <Typography variant="h3">Taxa de Conversão</Typography>
        <Typography variant="body">8.5%</Typography>
      </Card>
    </div>
  );
}
```

### Typography

```tsx
import { Typography } from '@lumina/aurora';

function Article() {
  return (
    <article>
      <Typography variant="h1">
        Título do Artigo
      </Typography>
      
      <Typography variant="body" className="mt-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Sed do eiusmod tempor incididunt ut labore.
      </Typography>

      <Typography variant="h2" className="mt-8">
        Seção 1
      </Typography>
      
      <Typography variant="body">
        Conteúdo da seção...
      </Typography>

      <Typography variant="small" className="text-gray-500 mt-2">
        Última atualização: 01/01/2024
      </Typography>
    </article>
  );
}
```

### Composição de Componentes

```tsx
import { Card, Button, Typography } from '@lumina/aurora';

function ProductCard({ product }) {
  return (
    <Card padding="lg">
      <img src={product.image} className="w-full h-48 object-cover rounded-xl mb-4" />
      
      <Typography variant="h3">{product.name}</Typography>
      
      <Typography variant="body" className="mt-2 text-gray-600">
        {product.description}
      </Typography>
      
      <div className="flex items-center justify-between mt-6">
        <Typography variant="h3" className="text-[#43302b]">
          R$ {product.price}
        </Typography>
        
        <Button variant="primary" size="sm">
          Adicionar
        </Button>
      </div>
    </Card>
  );
}
```

## 🎨 Customização

### Usando className

Todos os componentes aceitam `className` para customização:

```tsx
<Button 
  variant="primary"
  className="shadow-lg hover:shadow-xl"
>
  Custom Button
</Button>

<Card 
  padding="lg"
  className="border-2 border-[#d4af37]"
>
  Custom Card
</Card>
```

### Combinando com Tailwind

```tsx
<div className="container mx-auto px-4 py-8">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card padding="lg">
      <Typography variant="h2">Coluna 1</Typography>
    </Card>
    
    <Card padding="lg">
      <Typography variant="h2">Coluna 2</Typography>
    </Card>
  </div>
</div>
```

### Acessando Design Tokens

```tsx
import { colors, spacing } from '@lumina/aurora/tokens';

function CustomComponent() {
  return (
    <div style={{
      backgroundColor: colors.accent.rose,
      padding: spacing[6],
      borderRadius: '1.5rem',
    }}>
      Custom styled component
    </div>
  );
}
```

## 🔧 Integração com Frameworks

### Next.js

```tsx
// app/page.tsx
import { Button, Card, Typography } from '@lumina/aurora';

export default function Home() {
  return (
    <main className="container mx-auto p-8">
      <Typography variant="h1">Bem-vindo</Typography>
      <Card padding="lg" className="mt-6">
        <Button variant="primary">Get Started</Button>
      </Card>
    </main>
  );
}
```

### Vite + React

```tsx
// src/App.tsx
import { Button, Card, Typography } from '@lumina/aurora';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Typography variant="h1">Minha App</Typography>
      <Card padding="lg">
        <Typography variant="body">Conteúdo</Typography>
      </Card>
    </div>
  );
}

export default App;
```

## 📋 Patterns Comuns

### Formulário

```tsx
function LoginForm() {
  return (
    <Card padding="lg" className="max-w-md mx-auto">
      <Typography variant="h2" className="mb-6">Login</Typography>
      
      <form className="space-y-4">
        <div>
          <label className="block mb-2">
            <Typography variant="body">Email</Typography>
          </label>
          <input 
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl"
          />
        </div>
        
        <div>
          <label className="block mb-2">
            <Typography variant="body">Senha</Typography>
          </label>
          <input 
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl"
          />
        </div>
        
        <Button variant="primary" fullWidth>
          Entrar
        </Button>
      </form>
    </Card>
  );
}
```

### Lista com Actions

```tsx
function TaskList({ tasks }) {
  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <Card key={task.id} padding="md" className="flex items-center justify-between">
          <Typography variant="body">{task.title}</Typography>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Editar
            </Button>
            <Button variant="ghost" size="sm">
              Deletar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### Dashboard Layout

```tsx
function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-6">
        <Typography variant="h2">Dashboard</Typography>
      </header>
      
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <Card padding="lg">
            <Typography variant="h3">Metric 1</Typography>
            <Typography variant="body">Value</Typography>
          </Card>
          {/* ... more cards ... */}
        </div>
        
        <Card padding="lg">
          <Typography variant="h3" className="mb-4">Recent Activity</Typography>
          {/* Content */}
        </Card>
      </main>
    </div>
  );
}
```

## ⚡ Performance

### Tree Shaking

Aurora é otimizado para tree-shaking. Importe apenas o que usar:

```tsx
// ✅ Bom - apenas Button será incluído no bundle
import { Button } from '@lumina/aurora';

// ❌ Evitar - importa tudo
import * as Aurora from '@lumina/aurora';
```

### Code Splitting

Com React.lazy:

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Typography variant="body">Loading...</Typography>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## 🐛 Troubleshooting

### Componentes não aparecem

Verifique se as dependências peer foram instaladas:

```bash
npm install react react-dom
```

### Estilos não aplicados

Certifique-se de importar os estilos (se necessário):

```tsx
import '@lumina/aurora/dist/style.css';
```

### TypeScript errors

Certifique-se que o TypeScript está configurado:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}
```

## 📚 Recursos

- [Storybook](http://localhost:6006) - Componentes interativos
- [Component Spec](./COMPONENT_SPEC.md) - Como criar componentes
- [Design Tokens](./TOKENS.md) - Valores de design
- [README](../README.md) - Visão geral

## 💡 Dicas

1. **Use Storybook** para explorar todos os componentes
2. **Consulte os tokens** antes de hardcoding valores
3. **Combine com Tailwind** para layouts e utilities
4. **Use TypeScript** para autocomplete das props
5. **Siga os patterns** de composição mostrados aqui
