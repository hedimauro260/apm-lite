import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { AlertCircle, ArrowDownToLine, Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
import { cn, generateId } from "../../lib/utils";
import { db } from "../../database/db";
import type { Site, SiteMovement, SiteMovementType, Wallet } from "../../types";
import { computeSiteSummary, recomputeSiteBalances } from "./sitesLogic";
import { WebsitesSummaryCards } from "./WebsitesSummaryCards";
import { EarningsChartSection } from "./EarningsChartSection";
import { WebsitesTable } from "./WebsitesTable";
import { MovementsTable } from "./MovementsTable";
import {
    SiteModal,
    type SiteModalData,
} from "../../components/modals/SiteModal";
import {
    SiteMovementModal,
    type SiteMovementModalData,
} from "../../components/modals/SiteMovementModal";
import { DeleteSiteModal } from "../../components/modals/DeleteSiteModal";
import { DeleteMovementModal } from "../../components/modals/DeleteMovementModal";

interface Feedback {
    type: "success" | "error";
    message: string;
}

export default function WebsitesPage() {
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const [sites, setSites] = useState<Site[]>([]);
    const [movements, setMovements] = useState<SiteMovement[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);

    const [siteModal, setSiteModal] = useState<{
        open: boolean;
        mode: "create" | "edit";
        site?: Site;
    }>({ open: false, mode: "create" });
    const [movementModal, setMovementModal] = useState<{
        open: boolean;
        mode: "create" | "edit";
        movement?: SiteMovement;
        type: SiteMovementType;
        siteId?: string;
    }>({ open: false, mode: "create", type: "earn" });
    const [deletingSite, setDeletingSite] = useState<Site | null>(null);
    const [deletingMovement, setDeletingMovement] = useState<SiteMovement | null>(null);

    const showFeedback = useCallback(
        (message: string, type: Feedback["type"] = "success") => {
            setFeedback({ type, message });
            window.setTimeout(() => setFeedback(null), 3000);
        },
        [],
    );

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const [siteRows, movementRows, walletRows] = await Promise.all([
                    db.sites.toArray(),
                    db.siteMovements.toArray(),
                    db.wallets.toArray(),
                ]);
                if (!mounted) return;
                setSites(siteRows);
                setMovements(movementRows);
                setWallets(walletRows);
            } catch (error) {
                if (mounted) {
                    console.error("Error loading sites data", error);
                    setLoadError("Failed to load the platforms data.");
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const summary = useMemo(
        () => computeSiteSummary(sites, movements),
        [sites, movements],
    );

    const persistBalanceChanges = useCallback(
        async (nextSites: Site[], nextMovements: SiteMovement[]) => {
            try {
                await Promise.all([
                    ...nextMovements.map((m) =>
                        db.siteMovements.update(m.id, { balanceAfter: m.balanceAfter }),
                    ),
                    ...nextSites.map((s) =>
                        db.sites.update(s.id, {
                            balance: s.balance,
                            updatedAt: new Date().toISOString(),
                        }),
                    ),
                ]);
            } catch (error) {
                console.error("Error persisting balances", error);
            }
        },
        [],
    );

    // ============================================================
    // SITES
    // ============================================================
    const handleCreateSite = async (data: SiteModalData) => {
        const now = new Date().toISOString();
        const site: Site = {
            id: generateId(),
            name: data.name,
            url: data.url,
            initialBalance: data.initialBalance,
            balance: data.initialBalance,
            status: "active",
            color: data.color,
            description: data.description,
            createdAt: data.createdAt,
            updatedAt: now,
        };
        try {
            await db.sites.add(site);
        } catch (error) {
            console.error("Error adding site to the database", error);
        }
        setSites((prev) => [site, ...prev]);
        setSiteModal({ open: false, mode: "create" });
        showFeedback(`${site.name} added successfully`);
    };

    const handleUpdateSite = async (site: Site, data: SiteModalData) => {
        const updated: Site = {
            ...site,
            name: data.name,
            url: data.url,
            initialBalance: data.initialBalance,
            color: data.color,
            description: data.description,
            createdAt: data.createdAt,
        };
        const { sites: nextSites, movements: nextMovements } = recomputeSiteBalances(
            sites.map((s) => (s.id === site.id ? updated : s)),
            movements,
        );
        const target = nextSites.find((s) => s.id === site.id);
        const persisted: Site = target
            ? { ...updated, balance: target.balance, updatedAt: new Date().toISOString() }
            : updated;

        try {
            await db.sites.update(site.id, {
                name: persisted.name,
                url: persisted.url,
                initialBalance: persisted.initialBalance,
                balance: persisted.balance,
                color: persisted.color,
                description: persisted.description,
                createdAt: persisted.createdAt,
                updatedAt: persisted.updatedAt,
            });
            await Promise.all(
                nextMovements.map((m) =>
                    db.siteMovements.update(m.id, { balanceAfter: m.balanceAfter }),
                ),
            );
        } catch (error) {
            console.error("Error updating site in the database", error);
        }
        setSites(nextSites);
        setMovements(nextMovements);
        setSiteModal({ open: false, mode: "create" });
        showFeedback(`${persisted.name} updated successfully`);
    };

    const handleToggleStatus = async (site: Site) => {
        const nextStatus: Site["status"] =
            site.status === "active" ? "inactive" : "active";
        try {
            await db.sites.update(site.id, {
                status: nextStatus,
                updatedAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Error changing site status", error);
        }
        setSites((prev) =>
            prev.map((s) => (s.id === site.id ? { ...s, status: nextStatus } : s)),
        );
        showFeedback(
            `${site.name} ${nextStatus === "active" ? "reactivated" : "deactivated"}`,
        );
    };

    const handleDeleteSite = async (site: Site) => {
        try {
            await db.siteMovements.where("siteId").equals(site.id).delete();
            await db.sites.delete(site.id);
        } catch (error) {
            console.error("Error deleting site from the database", error);
        }
        setSites((prev) => prev.filter((s) => s.id !== site.id));
        setMovements((prev) => prev.filter((m) => m.siteId !== site.id));
        setDeletingSite(null);
        showFeedback(`${site.name} deleted`);
    };

    // ============================================================
    // MOVEMENTS
    // ============================================================
    const applyMovements = useCallback(
        async (nextMovements: SiteMovement[]) => {
            const { sites: nextSites, movements: recomputed } =
                recomputeSiteBalances(sites, nextMovements);
            setSites(nextSites);
            setMovements(recomputed);
            await persistBalanceChanges(nextSites, recomputed);
            return { nextSites, recomputed };
        },
        [sites, persistBalanceChanges],
    );

    const handleCreateMovement = async (data: SiteMovementModalData) => {
        const now = new Date().toISOString();
        const movement: SiteMovement = {
            id: generateId(),
            siteId: data.siteId,
            type: data.type,
            amount: data.amount,
            walletId: data.walletId,
            date: data.date,
            balanceAfter: 0,
            description: data.description,
            createdAt: now,
            updatedAt: now,
        };
        try {
            await db.siteMovements.add(movement);
        } catch (error) {
            console.error("Error adding movement to the database", error);
        }
        await applyMovements([...movements, movement]);
        setMovementModal({ open: false, mode: "create", type: "earn" });
        showFeedback(
            data.type === "earn"
                ? "Earning recorded successfully"
                : "Withdrawal recorded successfully",
        );
    };

    const handleUpdateMovement = async (
        movement: SiteMovement,
        data: SiteMovementModalData,
    ) => {
        const updated: SiteMovement = {
            ...movement,
            siteId: data.siteId,
            type: data.type,
            amount: data.amount,
            walletId: data.walletId,
            date: data.date,
            description: data.description,
            updatedAt: new Date().toISOString(),
        };
        try {
            await db.siteMovements.update(movement.id, updated);
        } catch (error) {
            console.error("Error updating movement in the database", error);
        }
        await applyMovements(
            movements.map((m) => (m.id === movement.id ? updated : m)),
        );
        setMovementModal({ open: false, mode: "create", type: "earn" });
        showFeedback("Movement updated successfully");
    };

    const handleDeleteMovement = async (movement: SiteMovement) => {
        try {
            await db.siteMovements.delete(movement.id);
        } catch (error) {
            console.error("Error deleting movement from the database", error);
        }
        await applyMovements(movements.filter((m) => m.id !== movement.id));
        setDeletingMovement(null);
        showFeedback("Movement deleted");
    };

    const openAddMovement = (type: SiteMovementType, siteId?: string) => {
        setMovementModal({
            open: true,
            mode: "create",
            type,
            siteId,
        });
    };

    const deletingMovementCount = deletingSite
        ? movements.filter((m) => m.siteId === deletingSite.id).length
        : 0;

    if (loading) {
        return (
            <div className="space-y-4 px-4">
                <Helmet>
                    <title>Websites | Asset Portfolio Manager Lite</title>
                </Helmet>
                <PageHeader
                    title="Websites"
                    subtitle="Income tracking for task platforms"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="card p-4 h-28 animate-pulse">
                            <div className="h-3 w-20 bg-surface-elevated rounded" />
                            <div className="mt-4 h-5 w-28 bg-surface-elevated rounded" />
                        </div>
                    ))}
                </div>
                <div className="card p-8 animate-pulse">
                    <div className="h-4 w-40 bg-surface-elevated rounded mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-10 w-full bg-surface-elevated rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 px-4">
            <Helmet>
                <title>Websites | Asset Portfolio Manager Lite</title>
                <meta
                    name="description"
                    content="Income tracking for task platforms"
                />
            </Helmet>

            {/* 1. PageHeader */}
            <PageHeader
                title="Websites"
                subtitle="Income tracking for task platforms"
                actions={
                    <>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openAddMovement("earn")}
                        >
                            <ArrowDownToLine className="h-4 w-4" />
                            Earning / Withdrawal
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSiteModal({ open: true, mode: "create" })}
                        >
                            <Plus className="h-4 w-4" />
                            Add Site
                        </Button>
                    </>
                }
            />

            {/* Feedback */}
            {feedback && (
                <div
                    role="status"
                    className={cn(
                        "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium animate-toast",
                        feedback.type === "success"
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-danger/30 bg-danger/10 text-danger",
                    )}
                >
                    <AlertCircle className="h-4 w-4" />
                    {feedback.message}
                </div>
            )}

            {loadError && (
                <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
                    <AlertCircle className="h-4 w-4" />
                    {loadError}
                </div>
            )}

            {/* 2. Summary Cards */}
            <WebsitesSummaryCards summary={summary} siteCount={sites.length} />

            {/* 3. Chart + Summary */}
            <EarningsChartSection movements={movements} summary={summary} />

            {/* 4. Sites Table */}
            <WebsitesTable
                sites={sites}
                movements={movements}
                onAddMovement={(siteId) => openAddMovement("earn", siteId)}
                onEdit={(site) => setSiteModal({ open: true, mode: "edit", site })}
                onDelete={setDeletingSite}
                onToggleStatus={handleToggleStatus}
            />

            {/* 5. Movements History */}
            <MovementsTable
                sites={sites}
                movements={movements}
                wallets={wallets}
                onAdd={() => openAddMovement("earn")}
                onEdit={(movement) =>
                    setMovementModal({
                        open: true,
                        mode: "edit",
                        movement,
                        type: movement.type,
                    })
                }
                onDelete={setDeletingMovement}
            />

            {/* Modals */}
            <SiteModal
                open={siteModal.open}
                mode={siteModal.mode}
                site={siteModal.site}
                onClose={() => setSiteModal({ open: false, mode: "create" })}
                onSubmit={handleCreateSite}
                onUpdate={handleUpdateSite}
            />
            <SiteMovementModal
                open={movementModal.open}
                mode={movementModal.mode}
                movement={movementModal.movement}
                sites={sites}
                wallets={wallets}
                defaultType={movementModal.type}
                defaultSiteId={movementModal.siteId}
                onClose={() =>
                    setMovementModal({ open: false, mode: "create", type: "earn" })
                }
                onSubmit={handleCreateMovement}
                onUpdate={handleUpdateMovement}
            />
            <DeleteSiteModal
                open={deletingSite !== null}
                site={deletingSite ?? undefined}
                movementCount={deletingMovementCount}
                onClose={() => setDeletingSite(null)}
                onConfirm={handleDeleteSite}
            />
            <DeleteMovementModal
                open={deletingMovement !== null}
                movement={deletingMovement ?? undefined}
                siteName={
                    deletingMovement
                        ? sites.find((s) => s.id === deletingMovement.siteId)?.name
                        : undefined
                }
                onClose={() => setDeletingMovement(null)}
                onConfirm={handleDeleteMovement}
            />
        </div>
    );
}
