
# Lumina Project Specification Kit (AI-First)

Este documento é o guia definitivo para agentes de IA expandirem o projeto Lumina.

## 🧠 Core Philosophy
Lumina é um "Digital Sanctuary". O software deve parecer calmo, sofisticado e intencional. 
- **Estética:** Pinterest-Core, Soft Girl, Clean Girl.
- **Interações:** Micro-interações suaves, feedbacks táteis e estados de carregamento elegantes.

## 🛠 Design System (Tailwind Tokens)
- `lumina-900`: Café/Espresso (#43302b) - Cor de texto principal e botões primários.
- `accent-rose`: Blush (#f4dada) - Destaques, hover e seleção.
- `bg-lumina-50`: Off-white creme (#fdf8f6) - Cor de fundo global.

## 🌐 i18n Rules
- Nunca use texto "hardcoded" nos componentes.
- Use o objeto `t` passado via props das `locales.ts`.
- Ao criar novos recursos, adicione chaves em `pt` e `en` simultaneamente.

## 💾 Database Architecture (DB-Ready)
- Todas as operações de dados devem passar por `services/persistenceService.ts`.
- Use `async/await` mesmo para `localStorage`.
- Padronize o retorno de erros para que a UI possa exibir Toasts de erro.

## 🤖 AI Features Implementation
- **Vision Board:** Use o modelo `gemini-2.5-flash-image`. Sempre adicione modificadores de estilo no prompt (`aesthetic`, `high resolution`, `soft lighting`) para manter a marca.
- **Chat Coaching:** Use `gemini-3-flash-preview` para sugestões de rotina.
- **Categorização:** A IA deve analisar as entradas de diário e sugerir tags automaticamente.

## 📁 Repository Structure
```text
/components      # UI Atômica (Design System)
/features        # Módulos Funcionais (Dashboard, Registry, etc)
/services        # Lógica de Negócio e APIs (Gemini, DB)
/locales         # Dicionários de Tradução
/types.ts        # Contratos de Dados
```

## 🎯 Próximas Features (Roadmap)
1. Integração com Google Calendar.
2. Mood Tracking com análise de sentimento via IA.
3. Moodboard compartilhado (Social Manifestation).
