import { Heart } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-sidebar border-t border-border px-6 py-4">
            <div className="flex items-center justify-center">
                <p className="flex items-center text-[10px] text-text-muted">
                    © {currentYear} - Made <Heart className="h-4 w-4 mx-1" /> <span className=" text-text-primary font-medium"> by Kubo Labs</span>
                </p>
            </div>
        </footer>
    );
}