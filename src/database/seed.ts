// src/database/seed.ts
import { db } from './db';
import type { Wallet, Asset, Transaction, Goal } from '../types';
import { generateId } from '../lib/utils';

// ⚡ Renomeado para getNow para evitar conflito com a variável 'now' (Date)
const getNow = () => new Date().toISOString();
const daysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
};

export async function seedDatabase() {
    // Verifica se já existem dados
    const walletCount = await db.wallets.count();
    if (walletCount > 0) return; // Já populado, sai da função

    console.log('🌱 Seeding database with mock data...');

    // 1. Wallets
    const wallets: Wallet[] = [
        { id: generateId(), name: 'Main Wallet', type: 'main', balance: 12450.00, status: 'active', createdAt: daysAgo(30), updatedAt: getNow() },
        { id: generateId(), name: 'Savings', type: 'savings', balance: 5860.00, status: 'active', createdAt: daysAgo(30), updatedAt: getNow() },
        { id: generateId(), name: 'Trading', type: 'trading', balance: 3240.00, status: 'active', createdAt: daysAgo(15), updatedAt: getNow() },
        { id: generateId(), name: 'Cold Storage', type: 'cold', balance: 15320.00, status: 'inactive', createdAt: daysAgo(60), updatedAt: getNow() },
    ];

    // 2. Assets
    const assets: Asset[] = [
        { id: generateId(), name: 'Bitcoin', symbol: 'BTC', type: 'crypto', quantity: 0.2456, purchasePrice: 58000, currentValue: 15320.00, walletId: wallets[3].id, createdAt: daysAgo(60), updatedAt: getNow() },
        { id: generateId(), name: 'Ethereum', symbol: 'ETH', type: 'crypto', quantity: 2.3500, purchasePrice: 3100, currentValue: 8200.00, walletId: wallets[0].id, createdAt: daysAgo(30), updatedAt: getNow() },
        { id: generateId(), name: 'Solana', symbol: 'SOL', type: 'crypto', quantity: 12.5000, purchasePrice: 110, currentValue: 1875.00, walletId: wallets[2].id, createdAt: daysAgo(15), updatedAt: getNow() },
        { id: generateId(), name: 'USD Cash', symbol: 'USD', type: 'fiat', quantity: 14250.00, purchasePrice: 1, currentValue: 14250.00, walletId: wallets[0].id, createdAt: daysAgo(30), updatedAt: getNow() },
    ];

    // 3. Transactions
    const transactions: Transaction[] = [
        {
            id: generateId(),
            walletId: wallets[0].id,
            type: 'deposit',
            amount: 12450.00,
            status: 'completed',
            coin: 'USD',
            date: daysAgo(25),
            description: 'Initial deposit',
            website: 'bank.example.com',
            createdAt: daysAgo(25),
            updatedAt: daysAgo(25)
        },
        {
            id: generateId(),
            walletId: wallets[0].id,
            relatedWalletId: wallets[1].id,
            type: 'transfer',
            amount: -5860.00,
            status: 'completed',
            coin: 'USD',
            date: daysAgo(20),
            description: 'Transfer to Savings',
            createdAt: daysAgo(20),
            updatedAt: daysAgo(20)
        },
        {
            id: generateId(),
            walletId: wallets[1].id,
            relatedWalletId: wallets[0].id,
            type: 'transfer',
            amount: 5860.00,
            status: 'completed',
            coin: 'USD',
            date: daysAgo(20),
            description: 'Received from Main',
            createdAt: daysAgo(20),
            updatedAt: daysAgo(20)
        },
        {
            id: generateId(),
            walletId: wallets[2].id,
            type: 'deposit',
            amount: 3240.00,
            status: 'completed',
            coin: 'USD',
            date: daysAgo(15),
            description: 'Trading capital',
            website: 'binance.com',
            createdAt: daysAgo(15),
            updatedAt: daysAgo(15)
        },
        {
            id: generateId(),
            walletId: wallets[0].id,
            type: 'withdraw',
            amount: -320.00,
            status: 'completed',
            coin: 'USD',
            date: daysAgo(4),
            description: 'ATM withdrawal',
            website: 'atm.example.com',
            createdAt: daysAgo(4),
            updatedAt: daysAgo(4)
        },
        {
            id: generateId(),
            walletId: wallets[3].id,
            type: 'deposit',
            amount: 15320.00,
            status: 'completed',
            coin: 'USD',
            date: daysAgo(60),
            description: 'Long term storage',
            website: 'ledger.com',
            createdAt: daysAgo(60),
            updatedAt: daysAgo(60)
        },
    ];

    // 4. Goals (um ativo)
    const nowDate = new Date();
    const weekStart = new Date(nowDate);
    weekStart.setDate(nowDate.getDate() - nowDate.getDay() + 1); // Segunda-feira
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Domingo
    weekEnd.setHours(23, 59, 59, 999);

    const goals: Goal[] = [
        {
            id: generateId(),
            name: 'July Campaign',
            status: 'active',
            startDate: weekStart.toISOString(),
            endDate: weekEnd.toISOString(),
            totalWeeklyGoal: 120,
            wallets: [
                {
                    walletId: wallets[3].id, // Cold Storage
                    walletName: wallets[3].name,
                    weeklyGoal: 30,
                    dailyGoals: { mon: 5, tue: 5, wed: 5, thu: 5, fri: 5, sat: 2, sun: 3 },
                },
                {
                    walletId: wallets[2].id, // Trading
                    walletName: wallets[2].name,
                    weeklyGoal: 90,
                    dailyGoals: { mon: 15, tue: 15, wed: 15, thu: 15, fri: 15, sat: 7, sun: 8 },
                },
            ],
            createdAt: weekStart.toISOString(),
            updatedAt: getNow(),
        },
    ];

    // Inserir em transação para garantir atomicidade (incluindo goals)
    try {
        // Inserir em transação para garantir atomicidade
        await db.transaction('rw', db.wallets, db.assets, db.transactions, db.goals, async () => {
            await db.wallets.bulkAdd(wallets);
            await db.assets.bulkAdd(assets);
            await db.transactions.bulkAdd(transactions);
            await db.goals.bulkAdd(goals);
        });

        // Se o código chegar aqui, significa que TODAS as tabelas foram inseridas com sucesso
        console.log('✅ Database seeded successfully!');

    } catch (error) {
        // Se QUALQUER tabela falhar, nenhuma alteração será guardada no banco
        console.error('❌ Failed to seed database. Transaction rolled back:', error);

        // Opcional: relançar o erro se o componente que chama o seed precisar de saber da falha
        throw error;
    }

    console.log('✅ Database seeded successfully!');
}