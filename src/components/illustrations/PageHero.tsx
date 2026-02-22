import React from 'react'
import { clsx } from 'clsx'

type HeroVariant = 'identity' | 'intelligence' | 'goals' | 'reflect' | 'advisory' | 'habits' | 'visualizations'

interface PageHeroProps {
  variant: HeroVariant
  className?: string
}

// ── Identity: Concentric hexagons + orbiting particles ──────────────────────
function IdentityHero() {
  return (
    <svg viewBox="0 0 320 120" className="w-full" aria-hidden="true">
      <defs>
        <radialGradient id="idGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="120" fill="url(#idGlow)" />

      {/* Concentric hexagons */}
      {[60, 44, 28, 14].map((r, i) => (
        <polygon
          key={r}
          points={`160,${60 - r} ${160 + r * 0.866},${60 - r * 0.5} ${160 + r * 0.866},${60 + r * 0.5} 160,${60 + r} ${160 - r * 0.866},${60 + r * 0.5} ${160 - r * 0.866},${60 - r * 0.5}`}
          fill="none"
          stroke="#8b5cf6"
          strokeOpacity={0.12 + i * 0.05}
          strokeWidth="1"
        />
      ))}

      {/* DNA double helix (left) */}
      {Array.from({ length: 10 }, (_, i) => {
        const t = (i / 9) * Math.PI * 3
        const y = 12 + (i / 9) * 96
        return (
          <g key={i}>
            <circle cx={55 + Math.sin(t) * 18} cy={y} r="2" fill="#8b5cf6" fillOpacity={0.4} />
            <circle cx={55 + Math.sin(t + Math.PI) * 18} cy={y} r="2" fill="#7c3aed" fillOpacity={0.25} />
            {i < 9 && (
              <line
                x1={55 + Math.sin(t) * 18} y1={y}
                x2={55 + Math.sin(t + Math.PI) * 18} y2={y}
                stroke="#8b5cf6" strokeOpacity="0.12" strokeWidth="0.8"
              />
            )}
          </g>
        )
      })}

      {/* Orbiting value dots */}
      {[0, 1, 2, 3, 4, 5, 6].map(i => {
        const angle = (i / 7) * Math.PI * 2 - Math.PI / 2
        const r = 50
        return (
          <circle
            key={i}
            cx={160 + Math.cos(angle) * r}
            cy={60 + Math.sin(angle) * r * 0.55}
            r="3"
            fill="#a78bfa"
            fillOpacity="0.5"
          />
        )
      })}

      {/* Core dot */}
      <circle cx="160" cy="60" r="5" fill="#8b5cf6" fillOpacity="0.7" />
      <circle cx="160" cy="60" r="8" fill="none" stroke="#8b5cf6" strokeOpacity="0.2" strokeWidth="1" />

      {/* Label tags (right) */}
      {['Vision', 'Values', 'Mission'].map((label, i) => (
        <g key={label}>
          <rect x="246" y={22 + i * 30} width={52} height={16} rx="4" fill="#8b5cf6" fillOpacity="0.08" stroke="#8b5cf6" strokeOpacity="0.2" strokeWidth="0.8" />
          <text x="272" y={34 + i * 30} textAnchor="middle" fill="#a78bfa" fontSize="7" fontFamily="monospace" opacity="0.7">{label}</text>
        </g>
      ))}
    </svg>
  )
}

// ── Intelligence: Neural network ─────────────────────────────────────────────
function IntelligenceHero() {
  const nodes = [
    { x: 50, y: 60 }, { x: 90, y: 25 }, { x: 90, y: 95 },
    { x: 140, y: 45 }, { x: 140, y: 75 }, { x: 190, y: 35 },
    { x: 190, y: 60 }, { x: 190, y: 85 }, { x: 240, y: 50 }, { x: 240, y: 70 },
    { x: 280, y: 60 },
  ]
  const edges = [
    [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [3, 6], [4, 6], [4, 7],
    [5, 8], [6, 8], [6, 9], [7, 9], [8, 10], [9, 10],
  ]

  return (
    <svg viewBox="0 0 320 120" className="w-full" aria-hidden="true">
      <defs>
        <radialGradient id="intGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="120" fill="url(#intGlow)" />

      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke="#3b82f6" strokeOpacity="0.18" strokeWidth="1"
        />
      ))}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="6" fill="#3b82f6" fillOpacity="0.12" stroke="#3b82f6" strokeOpacity="0.3" strokeWidth="1" />
          <circle cx={n.x} cy={n.y} r="2.5" fill="#60a5fa" fillOpacity={0.5 + (i % 3) * 0.15} />
        </g>
      ))}

      {/* Signal pulse highlight */}
      <circle cx="190" cy="60" r="10" fill="none" stroke="#3b82f6" strokeOpacity="0.2" strokeWidth="1.5" />
      <circle cx="190" cy="60" r="4" fill="#3b82f6" fillOpacity="0.6" />

      {/* Labels */}
      {[{ x: 50, y: 60, label: 'DECLARED' }, { x: 280, y: 60, label: 'OBSERVED' }].map(item => (
        <text key={item.label} x={item.x} y={item.label === 'DECLARED' ? 102 : 102} textAnchor="middle" fill="#60a5fa" fontSize="6" fontFamily="monospace" opacity="0.5">{item.label}</text>
      ))}
    </svg>
  )
}

// ── Goals: Rising trajectory arcs + milestone markers ────────────────────────
function GoalsHero() {
  return (
    <svg viewBox="0 0 320 120" className="w-full" aria-hidden="true">
      <defs>
        <radialGradient id="goalsGlow" cx="80%" cy="20%" r="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="120" fill="url(#goalsGlow)" />

      {/* Grid lines */}
      {[30, 60, 90].map(y => (
        <line key={y} x1="30" y1={y} x2="300" y2={y} stroke="#22c55e" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="4,4" />
      ))}

      {/* Trajectory curves */}
      {[
        { d: 'M 30 105 Q 165 40 300 15', color: '#22c55e', opacity: 0.5 },
        { d: 'M 30 110 Q 165 60 300 35', color: '#3b82f6', opacity: 0.35 },
        { d: 'M 30 115 Q 165 80 300 55', color: '#8b5cf6', opacity: 0.25 },
      ].map((t, i) => (
        <path key={i} d={t.d} fill="none" stroke={t.color} strokeOpacity={t.opacity} strokeWidth="1.5" />
      ))}

      {/* Milestone dots on primary trajectory */}
      {[
        { cx: 90, cy: 80 }, { cx: 160, cy: 52 }, { cx: 230, cy: 28 }, { cx: 300, cy: 15 },
      ].map((m, i) => (
        <g key={i}>
          <circle cx={m.cx} cy={m.cy} r="5" fill="#22c55e" fillOpacity="0.12" stroke="#22c55e" strokeOpacity="0.4" strokeWidth="1.2" />
          <circle cx={m.cx} cy={m.cy} r="2" fill="#22c55e" fillOpacity="0.8" />
        </g>
      ))}

      {/* Upward arrow at end */}
      <polygon points="300,6 295,14 305,14" fill="#22c55e" fillOpacity="0.7" />

      {/* Axis labels */}
      <text x="30" y="115" fill="#22c55e" fontSize="7" fontFamily="monospace" opacity="0.4">NOW</text>
      <text x="275" y="12" fill="#22c55e" fontSize="7" fontFamily="monospace" opacity="0.4">VISION</text>

      {/* Rising particles */}
      {[60, 110, 170, 220, 270].map((x, i) => (
        <circle key={i} cx={x} cy={30 + (i % 3) * 20} r="1.5" fill="#4ade80" fillOpacity="0.3" />
      ))}
    </svg>
  )
}

// ── Reflect: Ripple waves + breathing orb ────────────────────────────────────
function ReflectHero() {
  return (
    <svg viewBox="0 0 320 120" className="w-full" aria-hidden="true">
      <defs>
        <radialGradient id="reflectGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="120" fill="url(#reflectGlow)" />

      {/* Concentric ripple rings */}
      {[60, 48, 36, 24, 12].map((r, i) => (
        <ellipse
          key={r}
          cx="160" cy="55"
          rx={r * 1.5} ry={r}
          fill="none"
          stroke="#7c3aed"
          strokeOpacity={0.08 + i * 0.02}
          strokeWidth="1"
        />
      ))}

      {/* Calm sine waves (bottom) */}
      {[0, 1, 2].map(wave => {
        const y = 85 + wave * 10
        const amp = 5 - wave * 1.5
        const pts = Array.from({ length: 33 }, (_, i) => {
          const x = i * 10
          const wy = y + Math.sin(i * 0.5 + wave * 0.8) * amp
          return `${i === 0 ? 'M' : 'L'} ${x},${wy}`
        }).join(' ')
        return <path key={wave} d={pts} fill="none" stroke="#7c3aed" strokeOpacity={0.07 - wave * 0.015} strokeWidth="1" />
      })}

      {/* Central orb */}
      <circle cx="160" cy="55" r="10" fill="#7c3aed" fillOpacity="0.15" stroke="#7c3aed" strokeOpacity="0.3" strokeWidth="1" />
      <circle cx="160" cy="55" r="5" fill="#7c3aed" fillOpacity="0.5" />

      {/* Floating dust motes */}
      {[120, 145, 175, 195, 200, 130].map((x, i) => (
        <circle key={i} cx={x} cy={40 + (i * 7) % 30} r="1.5" fill="#a78bfa" fillOpacity="0.3" />
      ))}

      {/* Reflection prompt labels */}
      {['AM', 'PM', 'WEEKLY'].map((label, i) => (
        <g key={label}>
          <rect x={32 + i * 90} y="14" width="36" height="14" rx="4" fill="#7c3aed" fillOpacity="0.08" stroke="#7c3aed" strokeOpacity="0.18" strokeWidth="0.8" />
          <text x={50 + i * 90} y="24" textAnchor="middle" fill="#a78bfa" fontSize="6" fontFamily="monospace" opacity="0.6">{label}</text>
        </g>
      ))}
    </svg>
  )
}

// ── Advisory: Shield + radar sweep + pulse alerts ────────────────────────────
function AdvisoryHero() {
  return (
    <svg viewBox="0 0 320 120" className="w-full" aria-hidden="true">
      <defs>
        <radialGradient id="advisoryGlow" cx="30%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="120" fill="url(#advisoryGlow)" />

      {/* Shield outline */}
      <path d="M 80,20 L 110,20 L 110,55 Q 110,75 95,85 Q 80,75 80,55 Z"
        fill="#ef4444" fillOpacity="0.06" stroke="#ef4444" strokeOpacity="0.3" strokeWidth="1.2" />
      <path d="M 87,35 L 103,35 L 103,52 Q 103,62 95,68 Q 87,62 87,52 Z"
        fill="#ef4444" fillOpacity="0.12" />
      {/* Shield check */}
      <polyline points="89,52 93,57 102,45" fill="none" stroke="#f87171" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />

      {/* Radar (right) */}
      {[1, 2, 3].map(i => (
        <circle key={i} cx="230" cy="55" r={i * 22}
          fill="none" stroke="#ef4444" strokeOpacity={0.1 - i * 0.02} strokeWidth="1" />
      ))}
      {/* Crosshairs */}
      <line x1="164" y1="55" x2="296" y2="55" stroke="#ef4444" strokeOpacity="0.07" strokeWidth="0.8" />
      <line x1="230" y1="10" x2="230" y2="100" stroke="#ef4444" strokeOpacity="0.07" strokeWidth="0.8" />
      {/* Sweep line */}
      <line x1="230" y1="55" x2="272" y2="22" stroke="#f87171" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />

      {/* Alert pulse rings */}
      {[{ cx: 155, cy: 88, r: 12 }, { cx: 285, cy: 80, r: 10 }].map((ring, i) => (
        <g key={i}>
          <circle cx={ring.cx} cy={ring.cy} r={ring.r} fill="none" stroke="#ef4444" strokeOpacity="0.2" strokeWidth="1" />
          <circle cx={ring.cx} cy={ring.cy} r="3" fill="#ef4444" fillOpacity="0.4" />
        </g>
      ))}

      {/* Severity badges */}
      {[{ label: 'CHALLENGE', color: '#ef4444', x: 148, y: 22 }, { label: 'WARNING', color: '#f59e0b', x: 210, y: 22 }].map(b => (
        <g key={b.label}>
          <rect x={b.x} y="14" width={b.label === 'CHALLENGE' ? 52 : 44} height="13" rx="4"
            fill={b.color} fillOpacity="0.08" stroke={b.color} strokeOpacity="0.2" strokeWidth="0.8" />
          <text x={b.x + (b.label === 'CHALLENGE' ? 26 : 22)} y="23.5" textAnchor="middle"
            fill={b.color} fontSize="6" fontFamily="monospace" opacity="0.65">{b.label}</text>
        </g>
      ))}
    </svg>
  )
}

// ── Habits: Chain links + heatmap grid ──────────────────────────────────────
function HabitsHero() {
  const cells = Array.from({ length: 56 }, (_, i) => ({ col: i % 12, row: Math.floor(i / 12) }))

  return (
    <svg viewBox="0 0 320 120" className="w-full" aria-hidden="true">
      <defs>
        <radialGradient id="habitsGlow" cx="20%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#059669" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="120" fill="url(#habitsGlow)" />

      {/* Heatmap grid (right side) */}
      {cells.map((c, i) => {
        const intensity = Math.sin(i * 0.7 + c.col * 0.3) * 0.5 + 0.5
        return (
          <rect
            key={i}
            x={145 + c.col * 14} y={20 + c.row * 14}
            width="12" height="12" rx="2"
            fill="#059669"
            fillOpacity={0.04 + intensity * 0.18}
          />
        )
      })}

      {/* Chain link strand (left) */}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <ellipse cx="65" cy={20 + i * 16} rx="8" ry="6"
            fill="none" stroke="#059669" strokeOpacity={0.15 + (i % 2) * 0.15} strokeWidth="1.5" />
        </g>
      ))}
      {/* Connecting chain segments */}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1="65" y1={26 + i * 16} x2="65" y2={34 + i * 16}
          stroke="#059669" strokeOpacity="0.12" strokeWidth="1.5" />
      ))}

      {/* Streak arcs (center) */}
      {[30, 22, 14].map((r, i) => (
        <path
          key={i}
          d={`M ${110 - r},60 A ${r},${r} 0 0 1 ${110 + r},60`}
          fill="none"
          stroke="#34d399"
          strokeOpacity={0.25 - i * 0.06}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      <text x="110" y="55" textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="monospace" fontWeight="bold" opacity="0.55">🔥</text>

      {/* Habit labels */}
      {['Sleep', 'Workout', 'Journal'].map((label, i) => (
        <text key={label} x="65" y={112 + 0} textAnchor="middle" fill="#34d399" fontSize="0" opacity="0">{label}</text>
      ))}

      {/* Day labels above grid */}
      {['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F'].map((d, i) => (
        <text key={i} x={151 + i * 14} y="15" textAnchor="middle" fill="#059669" fontSize="6" fontFamily="monospace" opacity="0.3">{d}</text>
      ))}
    </svg>
  )
}

// ── Visualizations: Scatter + flowing lines ──────────────────────────────────
function VisualizationsHero() {
  const points = [
    { x: 45, y: 80 }, { x: 70, y: 55 }, { x: 95, y: 65 }, { x: 120, y: 40 },
    { x: 150, y: 70 }, { x: 175, y: 35 }, { x: 200, y: 50 }, { x: 225, y: 25 },
    { x: 255, y: 45 }, { x: 280, y: 30 }, { x: 60, y: 95 }, { x: 140, y: 90 },
    { x: 220, y: 75 }, { x: 290, y: 60 },
  ]

  return (
    <svg viewBox="0 0 320 120" className="w-full" aria-hidden="true">
      <defs>
        <radialGradient id="vizGlow" cx="85%" cy="20%" r="45%">
          <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="120" fill="url(#vizGlow)" />

      {/* Axes */}
      <line x1="35" y1="100" x2="300" y2="100" stroke="#FF6B35" strokeOpacity="0.15" strokeWidth="1" />
      <line x1="35" y1="10"  x2="35"  y2="100" stroke="#FF6B35" strokeOpacity="0.15" strokeWidth="1" />

      {/* Flow lines */}
      {[
        { d: 'M 35 80 C 120 70 200 30 300 20', color: '#FF6B35' },
        { d: 'M 35 90 C 120 75 200 55 300 45', color: '#8b5cf6' },
        { d: 'M 35 95 C 120 85 200 70 300 65', color: '#3b82f6' },
      ].map((line, i) => (
        <path key={i} d={line.d} fill="none" stroke={line.color} strokeOpacity="0.2" strokeWidth="1.5" />
      ))}

      {/* Scatter points */}
      {points.map((p, i) => {
        const colors = ['#FF6B35', '#8b5cf6', '#22c55e', '#3b82f6', '#ef4444']
        return (
          <circle
            key={i}
            cx={p.x} cy={p.y}
            r={2 + (i % 3)}
            fill={colors[i % colors.length]}
            fillOpacity="0.45"
          />
        )
      })}

      {/* Connection lines between nearby points */}
      {[[0, 1], [1, 3], [3, 5], [5, 7], [7, 9]].map(([a, b], i) => (
        <line key={i}
          x1={points[a].x} y1={points[a].y}
          x2={points[b].x} y2={points[b].y}
          stroke="#FF6B35" strokeOpacity="0.12" strokeWidth="0.8"
        />
      ))}

      {/* Badge */}
      <rect x="250" y="8" width="58" height="16" rx="4" fill="#FF6B35" fillOpacity="0.08" stroke="#FF6B35" strokeOpacity="0.2" strokeWidth="0.8" />
      <text x="279" y="19" textAnchor="middle" fill="#FF6B35" fontSize="7" fontFamily="monospace" opacity="0.65">75 CHARTS</text>
    </svg>
  )
}

const HERO_MAP: Record<HeroVariant, () => React.ReactElement> = {
  identity:       IdentityHero,
  intelligence:   IntelligenceHero,
  goals:          GoalsHero,
  reflect:        ReflectHero,
  advisory:       AdvisoryHero,
  habits:         HabitsHero,
  visualizations: VisualizationsHero,
}

export function PageHero({ variant, className }: PageHeroProps) {
  const Hero = HERO_MAP[variant]
  return (
    <div
      className={clsx(
        'w-full rounded-2xl overflow-hidden border border-[#2d2d4e]',
        'bg-[#0f0f1a]',
        className,
      )}
      style={{ animation: 'heroFadeIn 0.4s ease-out' }}
    >
      <Hero />
    </div>
  )
}
