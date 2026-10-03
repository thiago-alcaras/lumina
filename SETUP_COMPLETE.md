# Estado do projeto

A migração do monorepo foi concluída para o MVP local. Consulte o [README](README.md)
para instalação, funcionalidades, persistência, IA opcional e validação.

- Aplicação: `packages/lumina`.
- Design system: `packages/aurora`.
- API local: `server/index.mjs`.
- Desenvolvimento: `npm run dev`.
- Produção local: `npm run build` e `npm start`.
- Storybook: `npm run dev:aurora`.

São necessários Node.js 22.12+ e npm. Não há autenticação, banco remoto ou
integração com Google Calendar nesta versão. A IA exige uma chave Gemini no servidor.
