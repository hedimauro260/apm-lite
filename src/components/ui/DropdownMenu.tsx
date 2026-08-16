import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

export interface DropdownMenuProps {
    button: ReactNode;
    title?: string;
    align?: "left" | "right";
    menuClassName?: string;
    children: ReactNode;
}

const GAP = 4;

export function DropdownMenu({
    button,
    title = "Options",
    align = "right",
    menuClassName,
    children,
}: DropdownMenuProps) {
    const [open, setOpen] = useState(false);
    const [style, setStyle] = useState<CSSProperties>({});
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;
            if (
                triggerRef.current?.contains(target) ||
                menuRef.current?.contains(target)
            ) {
                return;
            }
            setOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
        };
    }, [open, close]);

    useLayoutEffect(() => {
        if (!open) return;

        const trigger = triggerRef.current;
        const menu = menuRef.current;
        if (!trigger || !menu) return;

        const rect = trigger.getBoundingClientRect();
        const height = menu.offsetHeight;
        const width = menu.offsetWidth;

        const desiredTopDown = rect.bottom + GAP;
        const desiredTopUp = rect.top - GAP - height;
        const fitsDown = desiredTopDown + height <= window.innerHeight - GAP;
        const fitsUp = desiredTopUp >= GAP;
        const openDown = fitsDown || !fitsUp;

        let left: number;
        if (align === "right") {
            left = rect.right - width;
        } else {
            left = rect.left;
        }
        left = Math.max(GAP, Math.min(left, window.innerWidth - width - GAP));

        const top = Math.max(
            GAP,
            Math.min(openDown ? desiredTopDown : desiredTopUp, window.innerHeight - height - GAP)
        );

        setStyle({ position: "fixed", top, left, zIndex: 50 });
    }, [open, align]);

    const toggle = (event: React.MouseEvent) => {
        event.stopPropagation();
        setOpen((value) => !value);
    };

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                onClick={toggle}
                title={title}
                aria-haspopup="menu"
                aria-expanded={open}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded transition-colors"
            >
                {button}
            </button>

            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        role="menu"
                        style={style}
                        onClick={close}
                        className={cn(
                            "w-44 bg-surface-elevated border border-border rounded-lg shadow-lg py-1",
                            menuClassName
                        )}
                    >
                        {children}
                    </div>,
                    document.body
                )}
        </>
    );
}
