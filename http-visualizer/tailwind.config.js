/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Outfit"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                brand: {
                    dark: '#050505',
                    panel: '#0a0a0c',
                    border: '#1f1f22',
                    text: '#a1a1aa',
                    accent: '#c084fc',
                    green: '#22c55e',
                    red: '#ef4444',
                    yellow: '#eab308',
                    blue: '#3b82f6',
                }
            }
        },
    },
    plugins: [],
}
