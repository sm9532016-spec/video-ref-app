import { getContrastColor } from '@/lib/utils';

interface ColorPaletteProps {
    colors: string[];
}

export default function ColorPalette({ colors }: ColorPaletteProps) {
    return (
        <div className="flex gap-2">
            {colors.map((color, index) => (
                <div key={index} className="flex-1">
                    <div
                        className="h-16 rounded-lg border border-dark-border flex items-center justify-center text-xs font-mono transition-transform hover:scale-105"
                        style={{ backgroundColor: color }}
                    >
                        <span
                            className="px-2 py-1 rounded bg-black/30 backdrop-blur-sm"
                            style={{
                                color: getContrastColor(color) === 'dark' ? '#000' : '#fff'
                            }}
                        >
                            {color}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
