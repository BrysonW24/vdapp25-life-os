export const CHART_COLORS = {
  bg: '#0f0f1a',
  surface: '#16162a',
  surfaceLight: '#1e1e35',
  border: '#2d2d4e',

  textPrimary: '#e8e8f0',
  textSecondary: '#808090',
  textMuted: '#606080',
  textDim: '#404060',

  brand: '#7c3aed',
  brandLight: '#8b5cf6',
  brandDim: 'rgba(124,58,237,0.12)',

  // VD orange — reserved for hero score ring + max 2-3 accent moments
  accent: '#FF6B35',
  accentLight: '#FF8A5C',
  accentDim: 'rgba(255,107,53,0.12)',

  // Semantic — alignment states
  aligned: '#22c55e',
  improving: '#3b82f6',
  drifting: '#eab308',
  avoiding: '#ef4444',
  regressing: '#ef4444',

  // Severity
  challenge: '#ef4444',
  warning: '#eab308',
  opportunity: '#3b82f6',
  insight: '#8b5cf6',

  // Chart structure
  gridLine: '#1a1a30',
  axisLine: '#2d2d4e',
  tooltip: '#16162a',
  tooltipBorder: '#2d2d4e',
} as const

/**
 * Scale canvas font sizes for mobile.
 * base: the intended size at full width (desktop).
 * width: container width from useContainerSize.
 * Returns a clamped size that stays legible on small screens.
 */
export function chartFontSize(base: number, width: number): number {
  if (width < 320) return Math.max(base * 0.82, 5)
  if (width < 480) return Math.max(base * 0.90, 5)
  return base
}
