// Componentes Básicos
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';

export { Modal } from './Modal';
export type { ModalProps } from './Modal';

export { Dropdown, DropdownItem, DropdownTrigger } from './Dropdown';
export type { DropdownProps, DropdownItemProps, DropdownTriggerProps } from './Dropdown';

export { ToastProvider, useToast } from './Toast';
export type { ToastData as Toast, ToastType } from './Toast';

export { InstallButton } from './InstallButton';

// Componentes de Layout
export { Section } from './Section';
export type { SectionProps } from './Section';

export { PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

// Componentes de Dados (NOVOS)
export { SummaryCard } from './SummaryCard';
export type { SummaryCardProps } from './SummaryCard';

export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';

export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps, StatusType } from './StatusBadge';

export { DataTable } from './DataTable';
export type { DataTableProps, Column } from './DataTable';

// Componentes Específicos
export { ActionGroup } from './ActionGroup';
export type { ActionGroupProps, ActionItem } from './ActionGroup';

export { WalletCard } from './WalletCard';
export type { WalletCardProps } from './WalletCard';

export { AssetCard } from './AssetCard';
export type { AssetCardProps } from './AssetCard';

export { FilterBar } from './FilterBar';
export type { FilterBarProps, FilterOption } from './FilterBar';

export { CalendarPopover } from './CalendarPopover';
export type { CalendarPopoverProps } from './CalendarPopover';

export { NavItem } from './NavItem';
export type { NavItemProps } from './NavItem';

export { SparkLine } from './SparkLine';
export type { SparkLineProps } from './SparkLine';

export { aggregateAssetsBySymbol, type AggregatedAsset } from '../../lib/utils';