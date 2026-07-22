//import { LayoutDashboard } from 'lucide-react';
import logo from '../../../assets/images/logo_transparent.webp';

export function Branding() {
    return (
        <div className="flex flex-col gap-3 px-4 py-6 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary">
                <img src={logo} alt="logo" className="h-8 w-8" />
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-bold text-text-primary leading-tight">
                    APM Lite
                </span>
                <span className="text-xs font-medium text-text-muted tracking-wide">
                    Asset Portfolio Manager
                </span>
            </div>
        </div>
    );
}