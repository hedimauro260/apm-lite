# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/),
e este projeto adere ao [Semantic Versioning](https://semver.org/).

## [0.10.1] - 2026-07-24

### Added

- Novos assets e seus logos

### Fixed

- Dashboard: correção no tamanho dos elementos
- Wallets: correção na cor escolhida para a carteira
- Correção com as configurações do PWA
- Outras pequenas correções

## [0.10.0] - 2026-07-22

### 🎉 Lançamento Completo

- Todas as 5 páginas principais funcionais
- Sistema de hooks personalizados consolidado
- PWA instalável
- Backup & Restore funcional

### Added

- **Dashboard**: SummaryCards com sparklines, WalletsModule, AssetsModule, GlobalActivityModule, LiveCryptoPrices
- **Wallets**: WalletCardExtended com gráfico de barras (Recharts), menu de contexto, accordion por wallet
- **Assets**: AssetsListView com dias rotacionados, PriceUpdateModal, AssetActionModal, AssetActivityTable
- **Transactions**: GlobalActivityModule com paginação, filtros (wallet, tipo, período), busca
- **Goals**: DailyGoalsTable, RecentGoalActivity, NewGoalModal (2 etapas), GoalListModal, GoalHistoryDrawer, ResetWeekDialog
- **Features**: TransactionStreak, CalendarPopover com highlights, InstallButton (PWA), BackupRestoreModal
- **Theme**: Dark/Light mode com persistência localStorage
- **Toast System**: 4 variantes (success, error, warning, info) com animações

### Arquitetura

- **GoalService**: Lógica isolada com snapshots imutáveis
- **Custom Hooks**: useWallets, useAssets, useTransactions, useGoals, usePortfolio, useTransactionStreak, useTransactionDates
- **Database**: Dexie v3 com 6 tables (wallets, assets, transactions, goals, goalSnapshots, assetMovements)

### Fixed

- SparkLine: adicionado `stroke="currentColor"` para funcionar com Tailwind
- Tailwind v4: configurado `@theme` com variáveis CSS para dark mode
- TypeScript: removidos warnings de variáveis não utilizadas

---

## [0.9.0] - Fase 7: Integração & Features

### 7.1 Custom Hooks

- useWallets.ts: CRUD operations
- useAssets.ts: CRUD + price updates + duplicate validation
- useTransactions.ts: CRUD + expandTransactions
- useGoals.ts: CRUD + archive + delete
- usePortfolio.ts: cálculos unificados + sparklines + distributions
- useTheme.ts: encapsulamento do ThemeContext

### 7.2 Features Adicionais

- PWA Manifest (vite-plugin-pwa)
- Backup & Restore (transação atômica Dexie)
- Transaction Streak (gamificação)
- CalendarPopover com highlights de transações
- Toast System revisado com 4 variantes

---

## [0.8.0] - Fase 6: Páginas Secundárias

### 6.1 Wallets Page

- PageHeader + SummaryCards (5 métricas)
- WalletCardExtended com Recharts
- GlobalActivityModule com paginação
- Modais: AddWallet, EditWallet, DeleteWallet, AddTransaction

### 6.2 Assets Page

- AssetMetricCard (novo layout)
- AssetsListView com accordion por wallet
- PriceUpdateModal (atualização em massa)
- AssetActivityTable com paginação
- assetMovements table no Dexie

### 6.3 Transactions Page

- Reutilização do GlobalActivityModule
- Sparklines via usePortfolioSummary
- Filtros: wallet, type, time range, search

### 6.4 Goals Page

- Goal + GoalSnapshot (separação de entidades)
- GoalService com 6 níveis de status
- DailyGoalsTable com dias rotacionados
- NewGoalModal (2 etapas, UX inteligente)
- GoalHistoryDrawer (snapshot imutável)
- ResetWeekDialog (3 opções contextuais)

---

## [0.7.0] - Fase 5: Modais e Formulários

- AddWalletModal, EditWalletModal, DeleteWalletModal
- AddTransactionModal, EditTransactionModal
- AddAssetModal com validação de duplicação
- Modal base component reutilizável
- Toast notifications system

---

## [0.6.0] - Fase 4: Banco de Dados

- Dexie.js setup com versioning
- Schema: wallets, assets, transactions, goals
- Seed database com dados mock
- Transações atômicas para operações críticas

---

## [0.5.0] - Fase 3: Componentes Base

- Button, Input, Modal, Section, StatusBadge
- SummaryCard com SparkLine
- Pagination component
- ThemeContext (dark/light)
- ToastProvider

---

## [0.4.0] - Fase 2: Layout e Navegação

- AppLayout com Sidebar
- Header com CalendarPopover
- React Router setup
- Navigation entre páginas
- Responsive design

---

## [0.3.0] - Fase 1: Fundação

- Vite + React + TypeScript setup
- Tailwind CSS v4 com @theme
- Estrutura de pastas
- TypeScript strict mode
- ESLint + Prettier

---

## [0.2.0] - 2026-06-15

### Initial Setup

- Projeto criado
- Dependências instaladas
- Hello World funcional

---

## Tipos de Mudanças

- **Added**: Novas funcionalidades
- **Changed**: Mudanças em funcionalidades existentes
- **Deprecated**: Funcionalidades que serão removidas
- **Removed**: Funcionalidades removidas
- **Fixed**: Correções de bugs
- **Security**: Correções de segurança
