import { cn } from '../../lib/utils';

export interface SparkLineProps {
    data: number[];
    color?: string; // Classe de cor do Tailwind (ex: 'text-success', 'text-primary')
    className?: string;
    height?: number;
}

export function SparkLine({ data, color = 'text-primary', className, height = 40 }: SparkLineProps) {
    if (!data || data.length === 0) return null;

    // Fallback para apenas 1 ponto de dados
    if (data.length === 1) {
        return (
            <div className={cn('w-full h-full flex items-center', className)}>
                <div className="h-1 w-full bg-current opacity-20 rounded-full" />
            </div>
        );
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 100; // viewBox width

    // Gera os pontos do polígono
    const points = data
        .map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            // Inverte Y porque no SVG o 0 é no topo
            const y = height - ((val - min) / range) * (height - 4);
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <div className={cn('w-full h-full', className)}> {/* ⚡ ADICIONADO: h-full */}
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
            >
                <polyline
                    points={points}
                    fill="none"
                    stroke="currentColor" // ⚡ CORREÇÃO CRÍTICA: Permite que a classe 'text-*' do Tailwind funcione
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={color}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </div>
    );
}