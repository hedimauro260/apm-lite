# APM Lite - Asset Portfolio Manager

**Versão:** 0.13.0  
**Status:** ✅ Todas as páginas funcionais

APM Lite é um gerenciador de portfólio financeiro pessoal que permite rastrear carteiras, ativos, transações, websites/exchanges e metas semanais de depósito. Construído com React 19, TypeScript, Tailwind CSS v4 e Dexie (IndexedDB).

## 🚀 Funcionalidades

### Páginas Principais

- **Dashboard**: Visão geral do portfólio com métricas, sparklines, preços de criptomoedas ao vivo e atividade recente
- **Wallets**: Gerenciamento de carteiras com cards visuais, menu de contexto e resumo por carteira
- **Assets**: Rastreamento de ativos com grid/tabela, atualização de preços, movimentações e histórico
- **Websites**: Rastreamento de websites/exchanges monitorados com saldo, movimentações (earn/withdraw), gráfico de ganhos e estatísticas de volume
- **Transactions**: Histórico completo com filtros, busca e paginação
- **Goals**: Metas semanais com streak, best wallet e snapshots arquivados

### Features

- 🌗 Modo escuro/claro com persistência
- 📱 Responsividade completa (sidebar colapsável, menu mobile em drawer, modais full-screen, tabelas com scroll horizontal)
- Sparklines animados em tempo real
- Transaction Streak (gamificação)
- 📅 Calendar com highlights de transações
- 💾 Backup & Restore via JSON (transação atômica)
- 📲 PWA instalável (Service Worker com autoUpdate)
- 🎯 6 níveis de progresso de metas
- Goal snapshots imutáveis
- ⚡ Otimizações: React.memo, lazy loading de ícones, code splitting no build

## 🛠️ Stack Tecnológica

| Categoria      | Tecnologia                      |
| -------------- | ------------------------------- |
| Frontend       | React 19 + TypeScript           |
| Build          | Vite 8                          |
| Estilização    | Tailwind CSS v4                 |
| Banco de Dados | Dexie.js v4 + dexie-react-hooks |
| Gráficos       | Recharts                        |
| Datas          | date-fns                        |
| Ícones         | Lucide React                    |
| Roteamento     | React Router v7                 |
| SEO/Head       | react-helmet-async              |
| Lint           | ESLint + typescript-eslint      |
| PWA            | vite-plugin-pwa                 |

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/hedimauro260/apm-lite.git
cd apm-lite

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Abrir em http://localhost:5173
```

## 📜 Scripts Disponíveis

npm run dev # Servidor de desenvolvimento (HMR)
npm run build # Build de produção (tsc + vite build)
npm run preview # Preview do build local

## Estrutura do Projeto

```bash
src/
├── components/          # APENAS componentes 100% compartilhados
│   ├── layout/          # AppLayout, Sidebar, Header
│   ├── modules/         # Componentes complexos reutilizáveis
│   ├── modals/          # Modais globais
│   └── ui/              # Componentes base (Button, Modal, Toast, etc.)
├── contexts/            # ThemeContext, ToastProvider
├── database/            # Dexie schema (v4) + seed + mocks de teste
├── hooks/               # Custom hooks globais (usePortfolio, useWallets, etc.)
├── lib/                 # Utils (formatCurrency, cn, backup.ts)
├── pages/               # Arquitetura por feature (Feature-Sliced Design)
│   ├── dashboard/       # Dashboard.tsx + components/ (exclusivos)
│   ├── wallets/         # Wallets.tsx + components/ (exclusivos)
│   ├── assets/          # Assets.tsx + components/ (exclusivos)
│   ├── transactions/    # Transactions.tsx + components/ (exclusivos)
│   ├── goals/           # Goals.tsx + components/ (exclusivos)
│   └── website/         # Website.tsx + components/ (exclusivos)
├── services/            # GoalService (lógica de negócio isolada da UI)
├── test/                # Setup do Vitest e mocks do Dexie
└── types/               # Interfaces e tipos TypeScript globais
```

### Lógica por página

Cada página possui seus próprios arquivos de lógica pura:

- `assetsLogic.ts` (Assets)
- `sitesLogic.ts` (Websites)
- `goalLogic.ts` (Goals)

## 🏗️ Arquitetura

### Camadas

UI Layer: Componentes React que renderizam os dados
Page Layer: Páginas orquestram estado com useLiveQuery (Dexie)
Logic Layer: Funções puras por página (cálculos, snapshots, saldos)
Data Layer: Dexie (IndexedDB) - persistência local

### Princípios

Separação de responsabilidades: UI não faz cálculos
Snapshots imutáveis: Goals arquivados nunca mudam
Transações atômicas: Backup/Restore são seguros
DRY: Lógica reutilizável dentro da página e componentes compartilhados
Performance: Memoização e code splitting para reduzir bundle size

### 🗄️ Banco de Dados

O app usa Dexie (IndexedDB) na versão 6 do schema, com 8 tabelas:

- `wallets` - carteiras
- `transactions` - transações financeiras
- `assets` - ativos monitorados
- `assetPositions` - posições de ativos por carteira
- `assetMovements` - movimentações de ativos
- `goals` - metas semanais
- `sites` - websites/exchanges monitorados
- `siteMovements` - movimentações de sites (earn/withdraw)

### 📱 PWA

O app é instalável como PWA com autoUpdate. Após o build:

- Acesse via HTTPS (ou localhost)
- Clique em "Install App" na sidebar
- Ou use o ícone de instalação do navegador

O Service Worker inclui runtime caching para Google Fonts e API da CoinGecko.

### 🔐 Backup & Restore

Localização: Sidebar → "Backup & Restore"
Export: Gera arquivo JSON com todos os dados (8 tabelas)
Import: Restaura via transação atômica (rollback em caso de erro)
Atenção: Import substitui TODOS os dados atuais

### ⚠️ IMPORTANTE: Mudança no Banco de Dados (Breaking Change)

A partir da versão 0.11.0, o schema do banco de dados foi atualizado para a versão 6 (adição da tabela websites e novos índices).

```
🚨 Backups gerados na versão 0.10.0 ou anteriores NÃO são compatíveis com esta versão.
Se você está atualizando de uma versão antiga, será necessário reinserir os dados manualmente ou desenvolver um script de migração customizado.
```

### 📄 Licença

MIT

---

Desenvolvido com ❤️ usando React + TypeScript + Tailwind CSS v4
