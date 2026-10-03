# Lumina — seu espaço para florescer

Lumina é um planejador pessoal: reúne compromissos, looks, objetivos visuais,
humor e reflexões em um espaço tranquilo. Aurora é seu design system React.

## Executar

Requisitos: **Node.js 22.12+** e npm. Use uma versão LTS atual do Node.

```bash
npm ci
npm run dev
```

Abra http://localhost:3000. O comando inicia a aplicação Vite na porta 3000 e
sua API local na porta 3001. Ambos são encerrados ao interromper o comando.

Para executar o build de produção:

```bash
npm run build
npm start
```

`npm start` serve a aplicação e a API em http://localhost:3000. O servidor se
vincula apenas à interface local. Esta versão é um aplicativo pessoal local;
exposição pública exige autenticação, limites por usuário e armazenamento no servidor.

## O que funciona

- **Painel:** próximos compromissos, objetivos recentes, registro diário de humor,
  atalhos e sugestões locais de autocuidado.
- **Calendário:** meses e dias reais, navegação, criação, edição e exclusão de
  compromissos por data e categoria.
- **Estilo:** criação e edição de looks com nome, categoria e imagem; filtros e exclusão.
- **Visão:** objetivos com imagens enviadas pelo usuário ou geradas pelo Gemini;
  edição e exclusão.
- **Diário:** reflexões de manhã ou noite, data, humor, histórico, edição e exclusão.
- **Busca:** pesquisa títulos, looks, objetivos e conteúdo do diário.
- **Português e inglês:** escolha de idioma preservada entre sessões.
- **Backup:** exportação JSON e restauração validada, com confirmação de substituição.

Os uploads aceitam PNG, JPEG e WebP de até 10 MB. Imagens enviadas são reduzidas a
até 1200 pixels e comprimidas em JPEG para economizar o armazenamento local.

## Dados pessoais

Os dados ficam no `localStorage` deste navegador, neste endereço. Outro navegador,
outro endereço ou limpeza dos dados do navegador não compartilha essas informações.
Faça backups regularmente. Ainda não há conta, sincronização ou banco remoto.

A primeira abertura migra os dados antigos `lumina_outfits`, `lumina_vision` e
`lumina_events`, preservando as chaves originais. A aplicação não grava antes de
concluir a leitura. Se houver dados corrompidos, bloqueia alterações e permite
exportar os originais ou restaurar um backup. Se o armazenamento ficar cheio,
informa a falha e permite exportar os dados que estão na memória.

## IA opcional

A aplicação funciona sem IA. Para habilitá-la, copie `.env.example` para `.env`
na raiz, defina `GEMINI_API_KEY` e reinicie o servidor:

```dotenv
GEMINI_API_KEY=sua_chave
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

A chave fica exclusivamente no servidor; não use o prefixo `VITE_`.
As sugestões enviam os compromissos de hoje ao Gemini, e a geração de imagens
envia a descrição digitada. Diário e looks não são enviados automaticamente.
A disponibilidade depende da chave, modelos e quota da conta Google.
Modelos podem ser alterados nas variáveis acima.

Referências da integração: [API Gemini](https://ai.google.dev/api) e
[geração de imagens](https://ai.google.dev/gemini-api/docs/generate-content/image-generation).

## Desenvolvimento e validação

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run dev:aurora
npm run build:storybook
```

Os testes unitários verificam persistência, migração, backup inválido, quota,
calendário e rotas de IA com um provedor simulado. Os testes de navegador cobrem
criação, edição, exclusão, uploads, busca, idioma, restauração e recarga em desktop
e mobile. Por padrão usam o Microsoft Edge instalado. Para usar o Chromium do
Playwright, remova `channel: 'msedge'` da configuração e execute
`npx playwright install chromium`.

## Estrutura

```text
packages/lumina/src/   # Aplicação React + TypeScript
packages/aurora/src/   # Componentes e tokens compartilhados
server/index.mjs      # API Gemini e servidor do build
scripts/dev.mjs       # Inicialização de desenvolvimento
 tests/               # Testes unitários e de navegador
```

Os arquivos antigos da raiz reexportam a implementação de `packages/lumina`.
Os estilos Tailwind são compilados localmente, incluindo os componentes Aurora;
não há dependência do CDN para renderizar a interface.

## Continuação do projeto

O projeto estava na migração para npm workspaces, com componentes ausentes,
interfaces demonstrativas e persistência incompleta. A continuação conclui o MVP
local. Próximos passos: autenticação e banco de dados, integração autorizada com
Google Calendar, análise de humor e compartilhamento de quadros com controle de acesso.

## Dependências e avisos conhecidos

Foram aplicadas atualizações compatíveis e versões corrigidas de lodash e uuid.
A auditoria ainda aponta a cadeia `braces → chokidar/micromatch → Tailwind 3`
(cinco alertas de desenvolvimento). A versão publicada de braces ainda está no
intervalo vulnerável. A resolução sugerida exige migrar para Tailwind 4, que fica
como manutenção pendente do design system. Esses pacotes não entram no bundle
React servido em produção. Consulte `npm audit` para a situação atual.
