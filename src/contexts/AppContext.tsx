// src/contexts/AppContext.tsx
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

// Usa um objeto genérico em vez de interface vazia
type AppContextValue = Record<string, unknown>;

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
}