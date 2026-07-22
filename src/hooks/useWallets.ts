import { useCallback } from 'react';
import { db } from '../database/db';
import type { Wallet, WalletStatus } from '../types';
import { useToast } from '../components/ui/Toast';
import { useLiveWallets } from './useLiveQuery';

export interface CreateWalletData {
    name: string;
    type: string;
    description?: string;
    color?: string;
}

export interface UseWalletsReturn {
    wallets: Wallet[];
    isLoading: boolean;
    error: string | null;
    createWallet: (data: CreateWalletData) => Promise<void>;
    updateWallet: (id: string, data: Partial<Wallet>) => Promise<void>;
    deleteWallet: (id: string) => Promise<void>;
    toggleStatus: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useWallets(): UseWalletsReturn {
    const wallets = useLiveWallets() || [];
    const isLoading = wallets === undefined;
    const { toast } = useToast();

    // Create
    const createWallet = useCallback(async (data: CreateWalletData) => {
        try {
            const newWallet: Wallet = {
                id: crypto.randomUUID(),
                name: data.name,
                type: data.type as any,
                balance: 0,
                status: 'active' as WalletStatus, // 👈 Fix 1: Cast explícito para o tipo correto
                description: data.description,
                color: data.color,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await db.wallets.add(newWallet);

            toast({
                type: 'success',
                title: 'Wallet created',
                message: `${data.name} has been added successfully`,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create wallet';
            toast({ type: 'error', title: 'Error', message });
            throw error;
        }
    }, [toast]);

    // Update
    const updateWallet = useCallback(async (id: string, data: Partial<Wallet>) => {
        try {
            await db.wallets.update(id, {
                ...data,
                updatedAt: new Date().toISOString(),
            });

            toast({
                type: 'success',
                title: 'Wallet updated',
                message: 'Wallet has been updated successfully',
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update wallet';
            toast({ type: 'error', title: 'Error', message });
            throw error;
        }
    }, [toast]);

    // Delete
    const deleteWallet = useCallback(async (id: string) => {
        try {
            await db.wallets.delete(id);

            toast({
                type: 'success',
                title: 'Wallet deleted',
                message: 'Wallet has been deleted successfully',
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete wallet';
            toast({ type: 'error', title: 'Error', message });
            throw error;
        }
    }, [toast]);

    // Toggle Status (Active/Inactive)
    const toggleStatus = useCallback(async (id: string) => {
        try {
            const wallet = wallets.find(w => w.id === id);
            if (!wallet) throw new Error('Wallet not found');

            const newStatus: WalletStatus = wallet.status === 'active' ? 'inactive' : 'active';
            await db.wallets.update(id, {
                status: newStatus,
                updatedAt: new Date().toISOString(),
            });

            toast({
                type: 'success',
                title: 'Wallet status updated',
                message: `${wallet.name} is now ${newStatus}`,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to toggle status';
            toast({ type: 'error', title: 'Error', message });
            throw error;
        }
    }, [wallets, toast]);

    // 👈 Fix 2: Função 'refresh' noop caso algum componente ainda chame por retrocompatibilidade
    const refresh = useCallback(async () => {
        // useLiveQuery atualiza automaticamente
    }, []);

    return {
        wallets,
        isLoading,
        error: null, // 👈 Satisfaz a interface UseWalletsReturn
        createWallet,
        updateWallet,
        deleteWallet,
        toggleStatus,
        refresh, // 👈 Satisfaz a interface UseWalletsReturn
    };
}