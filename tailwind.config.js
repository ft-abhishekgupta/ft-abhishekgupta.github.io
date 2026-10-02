import {nextui} from '@nextui-org/react'

/**
 * "Live Signal" palette — a night-shift monitoring console:
 *   ink     #070B16  deep night navy (dark background)
 *   paper   #F3F5FA  cool paper (light background)
 *   cobalt  #5B84FF  primary — links, focus, active state
 *   amber   #FFB020  signal — the live trace, "online" moments, highlights
 *   slate   #7D89A6  muted copy
 */
const signal = {
  ink: '#070B16',
  graphite: '#0E1426',
  paper: '#F3F5FA',
  cobalt: '#5B84FF',
  amber: '#FFB020',
  slate: '#7D89A6',
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        signal,
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'var(--font-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
          pixel: ['var(--font-pixel)', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        signal: 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-signal': 'cubic-bezier(0.7, 0, 0.84, 0)',
      },
      keyframes: {
        caret: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'tile-in': {
          from: { opacity: '0', transform: 'translateY(32px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        caret: 'caret 1.05s step-end infinite',
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            background: signal.ink,
            foreground: '#E8ECF5',
            content1: signal.graphite,
            content2: '#131A30',
            content3: '#1A2240',
            content4: '#222B4D',
            default: {
              DEFAULT: '#2C3757',
              foreground: '#FFFFFF',
              50: '#0C1222',
              100: '#141B31',
              200: '#1E2741',
              300: '#2C3757',
              400: '#5D6A8A',
              500: '#7D89A6',
              600: '#A3AEC7',
              700: '#C5CDDF',
              800: '#DEE3EE',
              900: '#EEF1F7',
            },
            primary: {
              DEFAULT: signal.cobalt,
              foreground: '#FFFFFF',
              50: '#0B1433',
              100: '#122054',
              200: '#1C3285',
              300: '#2A4BC0',
              400: '#4169EE',
              500: signal.cobalt,
              600: '#7E9EFF',
              700: '#A3BAFF',
              800: '#C8D5FF',
              900: '#E6ECFF',
            },
            secondary: {
              DEFAULT: signal.amber,
              foreground: signal.ink,
              50: '#2B1D00',
              100: '#4D3300',
              200: '#7A5200',
              300: '#A86F00',
              400: '#D88F00',
              500: signal.amber,
              600: '#FFC24D',
              700: '#FFD27F',
              800: '#FFE3B0',
              900: '#FFF3DE',
            },
            focus: signal.amber,
          },
        },
        light: {
          colors: {
            background: signal.paper,
            foreground: signal.ink,
            content1: '#FFFFFF',
            default: {
              DEFAULT: '#C3CADB',
              foreground: signal.ink,
              50: '#F7F8FC',
              100: '#ECEFF6',
              200: '#DCE1EC',
              300: '#C3CADB',
              400: '#8A94AD',
              500: '#66718D',
              600: '#4B5570',
              700: '#353E57',
              800: '#222A40',
              900: '#121829',
            },
            primary: {
              DEFAULT: '#2F5BEA',
              foreground: '#FFFFFF',
            },
            secondary: {
              DEFAULT: '#B86E00',
              foreground: '#FFFFFF',
            },
            focus: '#2F5BEA',
          },
        },
      },
    }),
  ],
}
