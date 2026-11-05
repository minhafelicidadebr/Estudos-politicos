/** AEGIS World Design Tokens — single source of truth for TypeScript consumption */

export const colors = {
  brand: {
    primary: '#0A1628',
    secondary: '#1A3A6B',
    accent: '#C9A84C',
    accentBright: '#F0C040',
  },
  neutral: {
    900: '#0D0D0D', 800: '#1A1A1A', 700: '#2D2D2D', 600: '#4A4A4A',
    400: '#8A8A8A', 200: '#D4D4D4', 100: '#F0F0F0', 50: '#F9F9F9',
  },
  surface: { glass: 'rgba(255,255,255,0.04)', card: 'rgba(255,255,255,0.06)' },
  confidence: { high: '#22C55E', medium: '#F59E0B', low: '#EF4444', inconclusive: '#6B7280' },
  axis: { a: '#3B82F6', b: '#8B5CF6', c: '#06B6D4' },
  semantic: { warning: '#F59E0B', error: '#EF4444', success: '#22C55E', info: '#3B82F6' },
} as const;

export const typography = {
  fontDisplay: "'Instrument Serif', Georgia, serif",
  fontBody: "'DM Sans', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
} as const;

export const motion = {
  durationInstant: '80ms',
  durationFast: '150ms',
  durationNormal: '250ms',
  durationSlow: '400ms',
  durationCinematic: '800ms',
  easeDefault: [0.4, 0, 0.2, 1] as const,
  easeSpring: [0.34, 1.56, 0.64, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  easeOut: [0, 0, 0.2, 1] as const,
} as const;

export const shadows = {
  glowAccent: '0 0 60px rgba(201,168,76,0.15)',
  glowBlue: '0 0 40px rgba(59,130,246,0.12)',
  card: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
  elevated: '0 4px 16px rgba(0,0,0,0.4)',
  floating: '0 8px 32px rgba(0,0,0,0.5)',
} as const;
