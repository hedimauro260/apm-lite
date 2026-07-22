// src/components/ui/InstallButton.tsx
import { useState, useEffect } from 'react';
import { Button } from './Button';
import { DownloadCloud } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        // ✅ Detectar se já está instalado (modo standalone)
        const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
        setIsStandalone(isInStandaloneMode);

        // ✅ Detectar se é desktop
        const isDesktopDevice = window.innerWidth >= 1024;
        setIsDesktop(isDesktopDevice);

        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsStandalone(true);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleAppInstalled);

        // ✅ Verificar também se já foi instalado via localStorage
        const hasBeenInstalled = localStorage.getItem('app_installed') === 'true';
        if (hasBeenInstalled || isInStandaloneMode) {
            setIsInstalled(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            // ✅ Se não houver prompt, tentar abrir uma mensagem para o usuário
            console.warn('Install prompt not available');
            return;
        }

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setIsInstalled(true);
                setIsStandalone(true);
                localStorage.setItem('app_installed', 'true');
            }
            setDeferredPrompt(null);
        } catch (error) {
            console.error('Installation failed:', error);
        }
    };

    // ✅ Condições para NÃO mostrar o botão:
    // 1. Já está instalado (isInstalled)
    // 2. Está em modo standalone (aplicativo já instalado)
    // 3. O usuário já instalou antes (flag no localStorage)
    // 4. Está em desktop e não há prompt disponível
    const shouldShow = !isInstalled &&
        !isStandalone &&
        !localStorage.getItem('app_installed') &&
        (deferredPrompt !== null || !isDesktop);

    // ✅ Se não deve mostrar, retorna null
    if (!shouldShow) {
        return null;
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleInstall}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-primary/25 bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary transition-all duration-150 hover:border-primary/40 hover:bg-primary/15 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar disabled:cursor-not-allowed disabled:opacity-60"
        >
            <DownloadCloud className="h-4 w-4" />
            Install App
        </Button>
    );
}