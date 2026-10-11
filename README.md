# ✦ Lumina

Seu jeito de brilhar. Uma rede de looks para mulheres e pessoas LGBT, com guarda-roupa privado e diário de estilo.

## Rodar localmente

Node.js 24 e pnpm 11.25.0. Na raiz:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abra http://localhost:3000. Sem variáveis Supabase, escolha **Explorar demonstração** na tela de entrada: perfis fictícios, fotos de exemplo e alterações salvas no IndexedDB deste navegador. Não há cobrança nem reconhecimento visual simulado.

Backend opcional para observar o estado de configuração:

```sh
node server/index.mjs
# Com .env preenchido:
pnpm api
```

API: http://localhost:3001/api/health. O Vite encaminha /api para a porta 3001.

## Nesta reconstrução

- Feed Para você com score por interesses e variação de ordem; Seguindo com contas seguidas.
- Paginação contínua na comunidade conectada; demo não repete exemplos indefinidamente.
- Stories com navegação e expiração de 24 horas.
- Looks com foto, título, descrição, mood, marca e link por peça.
- Likes, comentários, salvos, perfis, follow, bloqueio e denúncia.
- Guarda-roupa privado com recorte manual e deduplicação da mesma foto.
- Reconhecimento Gemini server-side com recortes e comparação de referências quando configurado.
- Calendário privado, moods cozy/romântico/minimalista/criativo/ousado.
- Layout web e mobile, PWA e configuração Capacitor.
- Supabase Auth/RLS/Storage, Stripe Checkout/Portal e webhook autenticado.
- Exclusão de conta e cancelamento da assinatura web mediante confirmação.

## Documentação


## Estrutura

- packages/lumina/src/social: domínio, adaptadores, componentes e stylesheet único.
- packages/lumina/src/App.tsx: composição da experiência.
- server: API Express autenticada e testes.
- supabase/schema.sql: esquema, políticas, ranking, cotas e cobrança.
- legacy: versões anteriores preservadas fora do build.

## Validar

```sh
pnpm test
pnpm build
```

O CI repete esses checks sem segredos. Testes PostgreSQL via PGlite validam regras do banco com schemas de Auth/Storage simulados. Serviços hospedados, IA real, Stripe e binários Android/iOS exigem validação externa. Leia o guia de produção antes de abrir assinaturas ao público.
