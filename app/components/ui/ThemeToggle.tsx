'use client';

import { useTheme } from '@/app/context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 hover:bg-dark-surface-light rounded-lg transition-colors group"
            aria-label="Toggle theme"
        >
            <div className="relative w-6 h-6">
                {/* Sun Icon */}
                <span
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'
                        }`}
                >
                    ☀️
                </span>

                {/* Moon Icon */}
                <span
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                        }`}
                >
                    🌙
                </span>
            </div>
        </button>
    );
}
