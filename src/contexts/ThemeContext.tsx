// src/contexts/ThemeContext.tsx (versão robusta)
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        // Verificar localStorage
        const savedTheme = localStorage.getItem('apm_theme') as Theme;
        if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;

        // Verificar preferência do sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }

        return 'dark'; // padrão
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // ✅ Remover ambas as classes
        root.classList.remove('dark', 'light');

        // ✅ Adicionar a classe correta
        root.classList.add(theme);

        // ✅ Salvar no localStorage
        localStorage.setItem('apm_theme', theme);

        // ✅ Atualizar meta tag theme-color (opcional)
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute(
                'content',
                theme === 'dark' ? '#0b1220' : '#ffffff'
            );
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}