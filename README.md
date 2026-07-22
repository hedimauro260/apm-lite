# APM Lite - Asset Portfolio Manager

**Versão:** 0.10.0  
**Status:** ✅ Todas as páginas funcionais

APM Lite é um gerenciador de portfólio financeiro pessoal que permite rastrear carteiras, ativos, transações e metas semanais de depósito. Construído com React, TypeScript, Tailwind CSS v4 e Dexie (IndexedDB).

## 🚀 Funcionalidades

### Páginas Principais

- **Dashboard**: Visão geral do portfólio com métricas, sparklines e atividade recente
- **Wallets**: Gerenciamento de carteiras com cards visuais, menu de contexto e gráfico de barras
- **Assets**: Rastreamento de ativos com tabela expansível, atualização de preços e histórico
- **Transactions**: Histórico completo com filtros, busca e paginação
- **Goals**: Metas semanais com streak, best wallet e snapshots arquivados

### Features

- 🌗 Modo escuro/claro com persistência
- Sparklines animados em tempo real
- Transaction Streak (gamificação)
- 📅 CalendarPopover com highlights de transações
- 💾 Backup & Restore via JSON (transação atômica)
- 📱 PWA instalável (Service Worker)
- 🎯 6 níveis de progresso de metas
- GoalService com snapshots imutáveis

## 🛠️ Stack Tecnológica

| Categoria      | Tecnologia               |
| -------------- | ------------------------ |
| Frontend       | React 18 + TypeScript    |
| Build          | Vite 5                   |
| Estilização    | Tailwind CSS v4          |
| Banco de Dados | Dexie.js (IndexedDB)     |
| Gráficos       | Recharts                 |
| Datas          | date-fns                 |
| Ícones         | Lucide React             |
| Testes         | Vitest + Testing Library |
| PWA            | vite-plugin-pwa          |

## Instalação

```bash
# Clonar o repositório
git clone <https://github.com/hedimauro260/apm-lite.git>
cd apm-lite

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Abrir em http://localhost:5173
```

## 📜 Scripts Disponíveis

npm run dev # Servidor de desenvolvimento (HMR)
npm run build # Build de produção
npm run preview # Preview do build local

## Estrutura do Projeto

src/
├── components/
│ ├── layout/ # AppLayout, Sidebar, Header
│ ├── modules/ # Componentes complexos (WalletCard, AssetsListView)
│ ├── modals/ # Todos os modais
│ └── ui/ # Componentes base (Button, Modal, Toast)
├── contexts/ # ThemeContext, ToastProvider
├── database/ # Dexie schema + seed
├── hooks/ # Custom hooks (usePortfolio, useWallets, etc.)
├── lib/ # Utils (formatCurrency, cn, backup)
├── pages/ # Dashboard, Wallets, Assets, Transactions, Goals
├── services/ # GoalService (lógica de negócio isolada)
└── types/ # TypeScript interfaces

## 🏗️ Arquitetura

### Camadas

UI Layer: Componentes React puros, recebem props
Hook Layer: useWallets, usePortfolio, etc. - orquestram estado
Service Layer: GoalService - lógica de negócio complexa
Data Layer: Dexie (IndexedDB) - persistência local

### Princípios

Separação de responsabilidades: UI não faz cálculos
Snapshots imutáveis: Goals arquivados nunca mudam
Transações atômicas: Backup/Restore são seguros
DRY: Hooks reutilizáveis em múltiplas páginas

### 📱 PWA

O app é instalável como PWA. Após o build:
Acesse via HTTPS (ou localhost)
Clique em "Install App" na sidebar
Ou use o ícone de instalação do navegador

### 🔐 Backup & Restore

Localização: Sidebar → "Backup & Restore"
Export: Gera arquivo JSON com todos os dados
Import: Restaura via transação atômica (rollback em caso de erro)
Atenção: Import substitui TODOS os dados atuais

### 📄 Licença

MIT

---

Desenvolvido com ❤️ usando React + TypeScript + Tailwind CSS v4
