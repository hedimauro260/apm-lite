# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/),
e este projeto adere ao [Semantic Versioning](https://semver.org/).

## [0.13.0] - 2026-08-14

### 🎨 Reformulação Completa de UI/UX

- **Sidebar**: Agora expande e encolhe (colapsável) para melhor uso do espaço em telas menores
- **Header**: Implementação de header responsivo com versão mobile dedicada
- **Calendário**: Redesign do CalendarPopover com melhor hierarquia visual e feedback de hover
- **Main Content**: Ajustes de espaçamento, tipografia e alinhamento em todas as páginas
- **Modais**: Reformulação completa
  - Modais eliminados: DeleteAssetModal (substituído por confirmação inline)
  - Modais simplificados: AddWalletModal, EditWalletModal, AddTransactionModal
  - Novos padrões visuais aplicados em todos os modais restantes
- **Tamanhos de elementos**: Padronização de paddings, margens e fontes em toda a aplicação

### 📱 Responsividade Completa

- Implementação de breakpoints consistentes (sm, md, lg, xl, 2xl)
- Grids adaptativos em todas as tabelas e cards
- Menu mobile com drawer lateral
- Tabelas com scroll horizontal em telas pequenas
- Modais full-screen em dispositivos móveis

### 🔧 Melhorias Técnicas

- Otimização de re-renders com React.memo em componentes pesados
- Lazy loading de ícones Lucide para reduzir bundle size
- Melhoria na acessibilidade (aria-labels, focus management)
- Animações de transição mais suaves (cubic-bezier)

---

## [0.12.0] - 2026-08-05

### 🌐 Nova Página: Website

- Página dedicada para gerenciar websites/exchanges monitorados
- Rastreamento de depósitos por website (regra de negócio do Goals)
- Estatísticas de volume por website
- Integração com filtro de transações por website

### 📦 Reestruturação do Projeto

- **Nova arquitetura de pastas**: Cada página agora tem sua própria pasta

- Separação clara entre componentes de página e componentes compartilhados
- Melhor organização e manutenção do código

### 🔧 Dependências

- **Adicionadas**:
  - `eslint` + plugins (linting e formatação de código)
  - `react-is` (otimização de componentes React)
- **Removidas**:
  - `uuid` (substituído por `crypto.randomUUID()` nativo)

---

## [0.11.0] - 2026-07-26

### ⚠️ BREAKING CHANGE: Schema do Banco de Dados

- **Mudança na estrutura do Dexie**: O backup da versão 0.10.0 **não é compatível** com esta versão
- Nova versão do banco: v4 (incrementada de v3)
- Migração automática de dados não implementada (usuário deve fazer novo backup após atualização)
- **Motivo**: Otimização de índices e normalização de dados para suportar a nova página Website

### 🗄️ Mudanças no Banco de Dados

- Nova tabela: `websites` (armazena exchanges/sites monitorados)
- Novo índice em `transactions`: `website` (para consultas rápidas por website)
- Atualização de índices em `assets` e `goals` para melhor performance
- Remoção de campos obsoletos em tabelas antigas

### 🔧 Melhorias de Performance

- Queries otimizadas com índices adequados
- Redução de scans completos em tabelas grandes
- Cache de dados frequentes em memória

---

## Notas de Migração (0.10.0 → 0.13.0)

### Para usuários da versão 0.10.0:

1. **Faça backup dos seus dados** antes de atualizar (usando a função de backup da 0.10.0)
2. Atualize para a versão 0.13.0
3. **O backup da 0.10.0 não será compatível** com a nova versão
4. Você precisará inserir os dados manualmente novamente ou usar um script de migração customizado

### Para desenvolvedores:

- A estrutura de pastas mudou significativamente
- Componentes que eram globais agora estão dentro de `pages/[nome]/components/`
- O schema do banco mudou (veja `src/database/db.ts`)
- Novas dependências instaladas (execute `npm install`)

---

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
