import { CompoundingIndex } from '@/components/visualizations/CompoundingIndex'
import { IntelligenceSpider } from '@/components/visualizations/IntelligenceSpider'
import { StructuralIntegrity } from '@/components/visualizations/StructuralIntegrity'
import { AlignmentCompass } from '@/components/visualizations/AlignmentCompass'
import { TimeAllocationSankey } from '@/components/visualizations/TimeAllocationSankey'
import { HabitHeatmap } from '@/components/visualizations/HabitHeatmap'
import { MoodEnergyLine } from '@/components/visualizations/MoodEnergyLine'
import { GoalTimeline } from '@/components/visualizations/GoalTimeline'
import { AlertSeverityBars } from '@/components/visualizations/AlertSeverityBars'
import { ValuesRadar } from '@/components/visualizations/ValuesRadar'
import { LifestyleDriftMeter } from '@/components/visualizations/LifestyleDriftMeter'
import { FreedomMeter } from '@/components/visualizations/FreedomMeter'
import { LifeSeasonDial } from '@/components/visualizations/LifeSeasonDial'
import { NinetyYearGrid } from '@/components/visualizations/NinetyYearGrid'
import { OutputOrbit } from '@/components/visualizations/OutputOrbit'
import { LifeEcosystem } from '@/components/visualizations/LifeEcosystem'
import { BodyEnergyReactor } from '@/components/visualizations/BodyEnergyReactor'
import { ImpactRipple } from '@/components/visualizations/ImpactRipple'
import { CorrelationMatrix } from '@/components/visualizations/CorrelationMatrix'
import { DisplacementHeatmap } from '@/components/visualizations/DisplacementHeatmap'
import { GoalErosionTimeline } from '@/components/visualizations/GoalErosionTimeline'
import { EntropyDriftMap } from '@/components/visualizations/EntropyDriftMap'
import { IdentityAlignmentIndex } from '@/components/visualizations/IdentityAlignmentIndex'
import { TimeBleedAnalysis } from '@/components/visualizations/TimeBleedAnalysis'
import { TrajectoryProjection } from '@/components/visualizations/TrajectoryProjection'
import { HabitChainStability } from '@/components/visualizations/HabitChainStability'
import { LifeSystemDependencyMap } from '@/components/visualizations/LifeSystemDependencyMap'
import { EnergyROI } from '@/components/visualizations/EnergyROI'
import { FutureRegretMeter } from '@/components/visualizations/FutureRegretMeter'
import { CognitiveStateHeatmap } from '@/components/visualizations/CognitiveStateHeatmap'
import { DecisionLoadTracker } from '@/components/visualizations/DecisionLoadTracker'
import { MacroLifeArc } from '@/components/visualizations/MacroLifeArc'
import { OneLeverAnalysis } from '@/components/visualizations/OneLeverAnalysis'
// Nutrition
import { FuelCompositionRing } from '@/components/visualizations/FuelCompositionRing'
import { NutritionOutputScatter } from '@/components/visualizations/NutritionOutputScatter'
import { InflammationCalendar } from '@/components/visualizations/InflammationCalendar'
import { DepletionSignal } from '@/components/visualizations/DepletionSignal'
import { MealTimingHeatmap } from '@/components/visualizations/MealTimingHeatmap'
import { NutritionVolatility } from '@/components/visualizations/NutritionVolatility'
import { EnergyBalanceWeight } from '@/components/visualizations/EnergyBalanceWeight'
import { FoodEnvironmentMap } from '@/components/visualizations/FoodEnvironmentMap'
// Mental Health
import { PsychWeatherMap } from '@/components/visualizations/PsychWeatherMap'
import { WindowOfTolerance } from '@/components/visualizations/WindowOfTolerance'
import { CognitiveDistortionMap } from '@/components/visualizations/CognitiveDistortionMap'
import { EmotionalDebtChart } from '@/components/visualizations/EmotionalDebtChart'
import { MoodEnergyStressTriangle } from '@/components/visualizations/MoodEnergyStressTriangle'
import { StateTransitionDiagram } from '@/components/visualizations/StateTransitionDiagram'
import { TriggerTimelineOverlay } from '@/components/visualizations/TriggerTimelineOverlay'
import { RecoveryHalfLife } from '@/components/visualizations/RecoveryHalfLife'
import { RuminationsVsAction } from '@/components/visualizations/RuminationsVsAction'
// Social & Relationships
import { SocialPortfolio } from '@/components/visualizations/SocialPortfolio'
import { OpportunityNetwork } from '@/components/visualizations/OpportunityNetwork'
import { RelationshipHealthRadar } from '@/components/visualizations/RelationshipHealthRadar'
import { ReciprocityBalance } from '@/components/visualizations/ReciprocityBalance'
import { ConnectionCadence } from '@/components/visualizations/ConnectionCadence'
import { ResilienceNetworkGraph } from '@/components/visualizations/ResilienceNetworkGraph'
import { EnergyAfterInteraction } from '@/components/visualizations/EnergyAfterInteraction'
// Causal Intelligence
import { CausalChainRenderer } from '@/components/visualizations/CausalChainRenderer'
import { UpstreamDownstreamView } from '@/components/visualizations/UpstreamDownstreamView'
import { CausalImpactMatrix } from '@/components/visualizations/CausalImpactMatrix'
import { LaggedCorrelationHeatmap } from '@/components/visualizations/LaggedCorrelationHeatmap'
import { InterventionCards } from '@/components/visualizations/InterventionCards'
// Momentum
import { MomentumVector } from '@/components/visualizations/MomentumVector'
import { TrajectoryDelta } from '@/components/visualizations/TrajectoryDelta'
import { MomentumVectorDial } from '@/components/visualizations/MomentumVectorDial'
import { TrajectoryBands } from '@/components/visualizations/TrajectoryBands'
import { WinRateDifficulty } from '@/components/visualizations/WinRateDifficulty'
// Knowledge & Learning
import { KnowledgeCompounding } from '@/components/visualizations/KnowledgeCompounding'
import { CognitiveLoadMeter } from '@/components/visualizations/CognitiveLoadMeter'
import { KnowledgeFlywheel } from '@/components/visualizations/KnowledgeFlywheel'
import { SkillTreeProgression } from '@/components/visualizations/SkillTreeProgression'
import { RecallStrengthCurve } from '@/components/visualizations/RecallStrengthCurve'
import { LearningROI } from '@/components/visualizations/LearningROI'
// Burnout Forecast
import { BurnoutPressureSystem } from '@/components/visualizations/BurnoutPressureSystem'
import { BurnoutRadar } from '@/components/visualizations/BurnoutRadar'
import { BurnoutThermometer } from '@/components/visualizations/BurnoutThermometer'
import { LoadRecoveryPhase } from '@/components/visualizations/LoadRecoveryPhase'
import { RedZoneAlerts } from '@/components/visualizations/RedZoneAlerts'
import { ReservesGauge } from '@/components/visualizations/ReservesGauge'
// Data Freshness & Decay
import { DataFreshnessMap } from '@/components/visualizations/DataFreshnessMap'
import { SkillAtrophyCurve } from '@/components/visualizations/SkillAtrophyCurve'
import { FreshnessHalo } from '@/components/visualizations/FreshnessHalo'
import { DataConfidenceMeter } from '@/components/visualizations/DataConfidenceMeter'
import { DecayTimeline } from '@/components/visualizations/DecayTimeline'
// Temporal Granularity
import { ZoomStack } from '@/components/visualizations/ZoomStack'
import { SeasonalityView } from '@/components/visualizations/SeasonalityView'
import { MicroMacroSplit } from '@/components/visualizations/MicroMacroSplit'
// Contradiction Detection
import { ContradictionSurface } from '@/components/visualizations/ContradictionSurface'
import { ContradictionCards } from '@/components/visualizations/ContradictionCards'
import { PriorityTimeSankey } from '@/components/visualizations/PriorityTimeSankey'
import { IntegrityIndex } from '@/components/visualizations/IntegrityIndex'
import { CommitmentDebtLedger } from '@/components/visualizations/CommitmentDebtLedger'
// Opportunity
import { OpportunityPipeline } from '@/components/visualizations/OpportunityPipeline'
import { useAlignments, useOverallScore } from '@/hooks/useIntelligence'
import { useIdentity, usePillars } from '@/hooks/useIdentity'
import { useGoals } from '@/hooks/useGoals'
import { useAllMilestones } from '@/hooks/useGoals'
import { useActiveHabits, useAllHabitLogs } from '@/hooks/useHabits'
import { useReflections } from '@/hooks/useReflections'
import { useAdvisoryAlerts } from '@/hooks/useAdvisory'
import { Eye, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

function VisualizationsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number
    let t = 0
    let w = 0, h = 0
    const dpr = window.devicePixelRatio || 1

    // Data scatter points
    const points = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 1 + Math.random() * 2,
      hue: Math.random() > 0.5 ? '#3b82f6' : Math.random() > 0.5 ? '#8b5cf6' : '#22c55e',
    }))

    function resize() {
      w = window.innerWidth; h = window.innerHeight
      canvas!.width = w * dpr; canvas!.height = h * dpr
      canvas!.style.width = `${w}px`; canvas!.style.height = `${h}px`
      ctx!.scale(dpr, dpr)
    }

    function animate() {
      ctx!.clearRect(0, 0, w, h)
      t += 0.005

      // Orange data glow — top right
      const grd = ctx!.createRadialGradient(w * 0.85, h * 0.12, 0, w * 0.85, h * 0.12, w * 0.45)
      grd.addColorStop(0, 'rgba(255,107,53,0.06)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx!.fillStyle = grd
      ctx!.fillRect(0, 0, w, h)

      // Flowing chart lines — horizontal data streams
      for (let line = 0; line < 4; line++) {
        ctx!.beginPath()
        const baseY = h * (0.2 + line * 0.18)
        for (let x = 0; x <= w; x += 8) {
          const y = baseY + Math.sin(x * 0.015 + t * 0.8 + line * 1.2) * 12
                         + Math.sin(x * 0.03 + t * 0.5 + line) * 6
          if (x === 0) ctx!.moveTo(x, y)
          else ctx!.lineTo(x, y)
        }
        const colors = ['#3b82f6', '#8b5cf6', '#FF6B35', '#22c55e']
        ctx!.strokeStyle = `${colors[line]}10`
        ctx!.lineWidth = 1
        ctx!.stroke()
      }

      // Moving scatter points
      points.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `${p.hue}28`
        ctx!.fill()
      })

      // Connect nearby scatter points
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x
          const dy = points[i].y - points[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 100) {
            ctx!.beginPath()
            ctx!.moveTo(points[i].x, points[i].y)
            ctx!.lineTo(points[j].x, points[j].y)
            ctx!.strokeStyle = `rgba(99,102,241,${0.05 * (1 - d / 100)})`
            ctx!.lineWidth = 0.5
            ctx!.stroke()
          }
        }
      }

      animId = requestAnimationFrame(animate)
    }

    resize(); animate()
    window.addEventListener('resize', resize)
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
  }, [])
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}

const GALLERY_SECTIONS = [
  {
    label: 'Confrontation',
    charts: [
      { name: '90-Year Grid', desc: 'Memento mori — 4,680 weeks of life, lived vs remaining' },
    ],
  },
  {
    label: 'Command Center',
    charts: [
      { name: 'Compounding Index', desc: 'Master score across all pillars with trend spark' },
    ],
  },
  {
    label: 'Master Views',
    charts: [
      { name: 'Life Ecosystem', desc: 'All 5 pillars as one living system — sky, soil, roots, canopy, seeds' },
      { name: 'Output Orbit', desc: 'Projects orbiting you — active, completed, abandoned, planned' },
      { name: 'Impact Ripple', desc: 'Concentric rings of influence from family to future generations' },
    ],
  },
  {
    label: 'Life Gauges',
    charts: [
      { name: 'Life Season Dial', desc: 'Current season of life — build, maintain, harvest, rest' },
      { name: 'Freedom Meter', desc: 'Financial runway and optionality gauge' },
      { name: 'Lifestyle Drift Meter', desc: 'Declared identity vs observed behavior gap' },
      { name: 'Body Energy Reactor', desc: 'Arc reactor — sleep, training, nutrition, recovery rings' },
    ],
  },
  {
    label: 'Correlation Engine',
    charts: [
      { name: 'Correlation Matrix', desc: 'Pentagon — pillar-to-pillar synergy/conflict connections' },
      { name: 'Displacement Heatmap', desc: 'Work intensity vs connection — the anti-correlation calendar' },
      { name: 'Goal Erosion Timeline', desc: 'Conditions that kill specific goals over time' },
    ],
  },
  {
    label: 'Alignment',
    charts: [
      { name: 'Intelligence Spider', desc: 'Radar of alignment scores across all pillars' },
      { name: 'Alignment Compass', desc: 'B.E.S.W. directional compass — where you\'re heading' },
    ],
  },
  {
    label: 'Structure',
    charts: [
      { name: 'Structural Integrity', desc: 'Foundation health of habits, goals, and systems' },
      { name: 'Values Radar', desc: 'Core values mapped to actual time and behavior' },
    ],
  },
  {
    label: 'Execution',
    charts: [
      { name: 'Habit Heatmap', desc: 'GitHub-style grid of daily habit completion' },
      { name: 'Goal Timeline', desc: 'Milestones and goal progress across pillars' },
      { name: 'Time Allocation Sankey', desc: '168 hours flowing from categories to activities' },
    ],
  },
  {
    label: 'Signals',
    charts: [
      { name: 'Mood & Energy Line', desc: 'Daily mood and energy trends from reflections' },
      { name: 'Alert Severity Bars', desc: 'Advisory system alerts by severity level' },
    ],
  },
  {
    label: 'Drift & Entropy',
    charts: [
      { name: 'Entropy Drift Map', desc: '30-day rolling drift per domain — sparklines, arrows, volatility' },
      { name: 'Future Regret Meter', desc: '"If I repeat this week 52x, am I proud?" gauge' },
    ],
  },
  {
    label: 'Identity & Trajectory',
    charts: [
      { name: 'Identity Alignment Index', desc: 'Dual spider — desired vs actual identity allocation' },
      { name: 'Trajectory Projection', desc: 'Two curves — if unchanged vs +5%/wk improvement' },
      { name: 'Macro Life Arc', desc: 'Age 20-80 with wealth, skill, health, social curves' },
    ],
  },
  {
    label: 'Systems & Leverage',
    charts: [
      { name: 'Life System Dependency Map', desc: 'Weighted node graph — downstream cascade effects' },
      { name: 'One Lever Analysis', desc: 'Single highest-leverage change this week' },
      { name: 'Energy ROI', desc: 'Activity bubbles — energy cost vs output multiplier' },
    ],
  },
  {
    label: 'Cognitive & Decisions',
    charts: [
      { name: 'Cognitive State Heatmap', desc: 'Focus, mood, stress, confidence with sleep/work overlay' },
      { name: 'Decision Load Tracker', desc: 'Decision density vs output quality — fatigue point' },
    ],
  },
  {
    label: 'Discipline',
    charts: [
      { name: 'Habit Chain Stability', desc: 'Waveform — oscillation vs stable rhythm over 90 days' },
      { name: 'Time Bleed Analysis', desc: 'Stacked bars — intentional vs reactive vs escapism hours' },
    ],
  },
  {
    label: 'Nutrition',
    charts: [
      { name: 'Fuel Composition Ring', desc: 'Concentric macro rings — protein, carbs, fat, micronutrients' },
      { name: 'Nutrition × Output Scatter', desc: 'Diet quality vs cognitive output correlation' },
      { name: 'Inflammation Calendar', desc: '90-day calendar heatmap of inflammation markers' },
      { name: 'Depletion Signal', desc: 'Body silhouette with micronutrient deficiency glows' },
      { name: 'Meal Timing Heatmap', desc: '30×18 heatmap of calorie density by time of day' },
      { name: 'Nutrition Volatility', desc: 'Three stacked sparklines showing macro variance' },
      { name: 'Energy Balance & Weight', desc: 'Calorie balance bars + weight trend line' },
      { name: 'Food Environment Map', desc: 'Horizontal bars by eating environment' },
    ],
  },
  {
    label: 'Mental Health',
    charts: [
      { name: 'Psych Weather Map', desc: 'Topographic mental health terrain over 12 months' },
      { name: 'Window of Tolerance', desc: 'Vertical arousal gauge with optimal zone' },
      { name: 'Cognitive Distortion Map', desc: 'Heatmap of distortion patterns over 12 weeks' },
      { name: 'Emotional Debt Chart', desc: 'Accumulating emotional debt with factor breakdown' },
      { name: 'Mood-Energy-Stress Triangle', desc: 'Barycentric plot of daily emotional states' },
      { name: 'State Transition Diagram', desc: 'Circular graph of mental state transitions' },
      { name: 'Trigger Timeline Overlay', desc: '5 overlaid signal lines over 30 days' },
      { name: 'Recovery Half-Life', desc: 'Arc gauge of stress recovery speed' },
      { name: 'Ruminations vs Action', desc: 'Weekly stacked bars — thinking vs doing' },
    ],
  },
  {
    label: 'Social & Relationships',
    charts: [
      { name: 'Social Portfolio', desc: 'Donut chart of relationship type allocation' },
      { name: 'Opportunity Network', desc: 'Network graph — relationships to opportunities' },
      { name: 'Relationship Health Radar', desc: 'Spider chart — frequency, depth, support, growth, tone' },
      { name: 'Reciprocity Balance', desc: 'Diverging bars — given vs received per relationship' },
      { name: 'Connection Cadence', desc: '12-week social interaction heatmap' },
      { name: 'Resilience Network Graph', desc: 'Concentric circle graph by relationship tier' },
      { name: 'Energy After Interaction', desc: 'Before/after energy scatter plot' },
    ],
  },
  {
    label: 'Causal Intelligence',
    charts: [
      { name: 'Causal Chain Renderer', desc: 'Directed causal graph between life variables' },
      { name: 'Upstream/Downstream View', desc: '3-layer hierarchical flow diagram' },
      { name: 'Causal Impact Matrix', desc: '6×6 input-output heatmap of effect sizes' },
      { name: 'Lagged Correlation Heatmap', desc: 'Variable pairs × time lags with peak highlight' },
      { name: 'Intervention Cards', desc: 'Before/after panels with delta bars per domain' },
    ],
  },
  {
    label: 'Life Momentum',
    charts: [
      { name: 'Momentum Vector', desc: 'Directional arrow with misalignment angle' },
      { name: 'Trajectory Delta', desc: 'Rate-of-change chart — compounding vs eroding' },
      { name: 'Momentum Dial', desc: 'Gauge with domain-segmented outer arc and speed ring' },
      { name: 'Trajectory Bands', desc: 'Desired/current/risk bands over 26 weeks' },
      { name: 'Win Rate × Difficulty', desc: 'Quadrant scatter of goals by success likelihood' },
    ],
  },
  {
    label: 'Knowledge & Learning',
    charts: [
      { name: 'Knowledge Compounding', desc: 'Exponential curve vs linear reference' },
      { name: 'Cognitive Load Meter', desc: 'Arc gauge of mental utilization by source' },
      { name: 'Knowledge Flywheel', desc: 'Acquire → Practice → Connect → Teach → Create cycle' },
      { name: 'Skill Tree Progression', desc: 'Horizontal bars of skill levels sorted by mastery' },
      { name: 'Recall Strength Curve', desc: 'Ebbinghaus decay with knowledge item positions' },
      { name: 'Learning ROI', desc: 'Hours invested vs value returned bubble chart' },
    ],
  },
  {
    label: 'Burnout Forecast',
    charts: [
      { name: 'Burnout Pressure System', desc: 'Pressure vessel with stacked stress sources' },
      { name: 'Burnout Radar', desc: '6-domain radar — exhaustion, cynicism, inefficacy' },
      { name: 'Burnout Thermometer', desc: 'Mercury gauge from thriving to critical' },
      { name: 'Load vs Recovery', desc: 'Dual line — load and recovery balance over 12 weeks' },
      { name: 'Red Zone Alerts', desc: 'Card list of metrics breaching thresholds' },
      { name: 'Reserves Gauge', desc: 'Vertical tank gauges for physical, emotional, cognitive reserves' },
    ],
  },
  {
    label: 'Data Freshness & Decay',
    charts: [
      { name: 'Data Freshness Map', desc: 'Grid of data sources with staleness indicators' },
      { name: 'Skill Atrophy Curve', desc: 'Exponential decay curves per skill since practice' },
      { name: 'Freshness Halo', desc: 'Radial domain freshness with glow intensity' },
      { name: 'Data Confidence Meter', desc: 'Stacked bars — freshness, consistency, volume' },
      { name: 'Decay Timeline', desc: 'Multi-event decay curves from activity start points' },
    ],
  },
  {
    label: 'Temporal Granularity',
    charts: [
      { name: 'Zoom Stack', desc: 'Nested layers — today → week → month → quarter → year' },
      { name: 'Seasonality View', desc: '12×4 month-week heatmap of performance patterns' },
      { name: 'Micro/Macro Split', desc: 'Daily noise vs monthly trend comparison' },
    ],
  },
  {
    label: 'Contradiction Detection',
    charts: [
      { name: 'Contradiction Surface', desc: 'Stated beliefs vs observed actions with severity' },
      { name: 'Belief vs Evidence', desc: 'Card list of self-beliefs contradicted by data' },
      { name: 'Priority vs Time', desc: 'Sankey — priority rank order vs actual time allocation' },
      { name: 'Integrity Index', desc: 'Trend sparkline + domain breakdown of alignment' },
      { name: 'Commitment Debt Ledger', desc: 'Promised vs actual frequency with debt scores' },
      { name: 'Opportunity Pipeline', desc: 'Kanban funnel — identified → evaluating → acting → captured' },
    ],
  },
]

export function VisualizationsPage() {
  const [guideOpen, setGuideOpen] = useState(false)
  const alignments = useAlignments()
  const overallScore = useOverallScore()
  const identity = useIdentity()
  const pillars = usePillars(identity?.id)
  const goals = useGoals()
  const milestones = useAllMilestones()
  const habits = useActiveHabits()
  const habitLogs = useAllHabitLogs()
  const reflections = useReflections()
  const alerts = useAdvisoryAlerts()

  return (
    <>
    <VisualizationsCanvas />
    <div className="relative space-y-8" style={{ zIndex: 1 }}>
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #FF6B35)' }}
          >
            <Eye size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#e8e8f0] tracking-tight">Visualizations</h1>
            <p
              className="text-[10px] text-[#606080] tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Life intelligence gallery · 75 charts
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Guide */}
      <div className="rounded-xl border border-[#2d2d4e] bg-[#16162a] overflow-hidden">
        <button
          onClick={() => setGuideOpen(!guideOpen)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#1a1a32] transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
            <span
              className="text-[10px] tracking-[0.15em] uppercase text-[#808090] font-medium"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Gallery Guide — 25 sections · 75 visualizations
            </span>
          </div>
          <ChevronDown
            size={14}
            className="text-[#606080] transition-transform duration-200"
            style={{ transform: guideOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {guideOpen && (
          <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid #2d2d4e' }}>
            {GALLERY_SECTIONS.map((section) => (
              <div key={section.label} className="pt-3">
                <p
                  className="text-[8px] tracking-[0.2em] uppercase text-[#505070] font-semibold mb-1.5"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {section.label}
                </p>
                <div className="space-y-1">
                  {section.charts.map((chart) => (
                    <div key={chart.name} className="flex items-baseline gap-2">
                      <span
                        className="text-[10px] text-[#c0c0d0] font-medium shrink-0"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {chart.name}
                      </span>
                      <div className="flex-1 border-b border-dotted border-[#2d2d4e] min-w-[20px] translate-y-[-2px]" />
                      <span
                        className="text-[9px] text-[#505070]"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {chart.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ MEMENTO MORI ═══ */}
      <section>
        <SectionLabel label="Confrontation" />
        <NinetyYearGrid />
      </section>

      {/* ═══ HERO: Compounding Index ═══ */}
      <section>
        <SectionLabel label="Command Center" />
        <CompoundingIndex />
      </section>

      {/* ═══ MASTER VIEWS ═══ */}
      <section>
        <SectionLabel label="Master Views" />
        <div className="space-y-4">
          <LifeEcosystem />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OutputOrbit />
            <ImpactRipple />
          </div>
        </div>
      </section>

      {/* ═══ LIFE GAUGES ═══ */}
      <section>
        <SectionLabel label="Life Gauges" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LifeSeasonDial />
          <FreedomMeter />
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LifestyleDriftMeter />
          <BodyEnergyReactor />
        </div>
      </section>

      {/* ═══ CORRELATION ENGINE ═══ */}
      <section>
        <SectionLabel label="Correlation Engine" />
        <div className="space-y-4">
          <CorrelationMatrix />
          <DisplacementHeatmap />
          <GoalErosionTimeline />
        </div>
      </section>

      {/* ═══ ALIGNMENT ═══ */}
      <section>
        <SectionLabel label="Alignment" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <IntelligenceSpider alignments={alignments} overallScore={overallScore} />
          <AlignmentCompass />
        </div>
      </section>

      {/* ═══ STRUCTURAL ═══ */}
      <section>
        <SectionLabel label="Structure" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StructuralIntegrity />
          <ValuesRadar values={identity?.coreValues ?? []} />
        </div>
      </section>

      {/* ═══ EXECUTION ═══ */}
      <section>
        <SectionLabel label="Execution" />
        <div className="space-y-4">
          <HabitHeatmap logs={habitLogs} habitCount={habits.length} />
          <GoalTimeline goals={goals} milestones={milestones} pillars={pillars} />
          <TimeAllocationSankey />
        </div>
      </section>

      {/* ═══ SIGNALS ═══ */}
      <section>
        <SectionLabel label="Signals" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MoodEnergyLine reflections={reflections} />
          <AlertSeverityBars alerts={alerts} />
        </div>
      </section>

      {/* ═══ DRIFT & ENTROPY ═══ */}
      <section>
        <SectionLabel label="Drift & Entropy" />
        <div className="space-y-4">
          <EntropyDriftMap />
          <FutureRegretMeter />
        </div>
      </section>

      {/* ═══ IDENTITY & TRAJECTORY ═══ */}
      <section>
        <SectionLabel label="Identity & Trajectory" />
        <div className="space-y-4">
          <IdentityAlignmentIndex />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TrajectoryProjection />
            <MacroLifeArc />
          </div>
        </div>
      </section>

      {/* ═══ SYSTEMS & LEVERAGE ═══ */}
      <section>
        <SectionLabel label="Systems & Leverage" />
        <div className="space-y-4">
          <LifeSystemDependencyMap />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OneLeverAnalysis />
            <EnergyROI />
          </div>
        </div>
      </section>

      {/* ═══ COGNITIVE & DECISIONS ═══ */}
      <section>
        <SectionLabel label="Cognitive & Decisions" />
        <div className="space-y-4">
          <CognitiveStateHeatmap />
          <DecisionLoadTracker />
        </div>
      </section>

      {/* ═══ DISCIPLINE ═══ */}
      <section>
        <SectionLabel label="Discipline" />
        <div className="space-y-4">
          <HabitChainStability />
          <TimeBleedAnalysis />
        </div>
      </section>

      {/* ═══ NUTRITION ═══ */}
      <section>
        <SectionLabel label="Nutrition" />
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FuelCompositionRing />
            <NutritionOutputScatter />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InflammationCalendar />
            <DepletionSignal />
          </div>
          <MealTimingHeatmap />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NutritionVolatility />
            <EnergyBalanceWeight />
          </div>
          <FoodEnvironmentMap />
        </div>
      </section>

      {/* ═══ MENTAL HEALTH ═══ */}
      <section>
        <SectionLabel label="Mental Health" />
        <div className="space-y-4">
          <PsychWeatherMap />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <WindowOfTolerance />
            <CognitiveDistortionMap />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EmotionalDebtChart />
            <MoodEnergyStressTriangle />
          </div>
          <StateTransitionDiagram />
          <TriggerTimelineOverlay />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RecoveryHalfLife />
            <RuminationsVsAction />
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL & RELATIONSHIPS ═══ */}
      <section>
        <SectionLabel label="Social & Relationships" />
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SocialPortfolio />
            <OpportunityNetwork />
          </div>
          <RelationshipHealthRadar />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReciprocityBalance />
            <ConnectionCadence />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResilienceNetworkGraph />
            <EnergyAfterInteraction />
          </div>
        </div>
      </section>

      {/* ═══ CAUSAL INTELLIGENCE ═══ */}
      <section>
        <SectionLabel label="Causal Intelligence" />
        <div className="space-y-4">
          <CausalChainRenderer />
          <UpstreamDownstreamView />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CausalImpactMatrix />
            <LaggedCorrelationHeatmap />
          </div>
          <InterventionCards />
        </div>
      </section>

      {/* ═══ LIFE MOMENTUM ═══ */}
      <section>
        <SectionLabel label="Life Momentum" />
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MomentumVector />
            <MomentumVectorDial />
          </div>
          <TrajectoryDelta />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TrajectoryBands />
            <WinRateDifficulty />
          </div>
        </div>
      </section>

      {/* ═══ KNOWLEDGE & LEARNING ═══ */}
      <section>
        <SectionLabel label="Knowledge & Learning" />
        <div className="space-y-4">
          <KnowledgeCompounding />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CognitiveLoadMeter />
            <KnowledgeFlywheel />
          </div>
          <SkillTreeProgression />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RecallStrengthCurve />
            <LearningROI />
          </div>
        </div>
      </section>

      {/* ═══ BURNOUT FORECAST ═══ */}
      <section>
        <SectionLabel label="Burnout Forecast" />
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BurnoutPressureSystem />
            <BurnoutRadar />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BurnoutThermometer />
            <LoadRecoveryPhase />
          </div>
          <RedZoneAlerts />
          <ReservesGauge />
        </div>
      </section>

      {/* ═══ DATA FRESHNESS & DECAY ═══ */}
      <section>
        <SectionLabel label="Data Freshness & Decay" />
        <div className="space-y-4">
          <DataFreshnessMap />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SkillAtrophyCurve />
            <FreshnessHalo />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DataConfidenceMeter />
            <DecayTimeline />
          </div>
        </div>
      </section>

      {/* ═══ TEMPORAL GRANULARITY ═══ */}
      <section>
        <SectionLabel label="Temporal Granularity" />
        <div className="space-y-4">
          <ZoomStack />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SeasonalityView />
            <MicroMacroSplit />
          </div>
        </div>
      </section>

      {/* ═══ CONTRADICTION DETECTION ═══ */}
      <section>
        <SectionLabel label="Contradiction Detection" />
        <div className="space-y-4">
          <ContradictionSurface />
          <ContradictionCards />
          <PriorityTimeSankey />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <IntegrityIndex />
            <CommitmentDebtLedger />
          </div>
          <OpportunityPipeline />
        </div>
      </section>
    </div>
    </>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <p
        className="text-[9px] tracking-[0.2em] uppercase text-[#404060] font-medium"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </p>
      <div className="flex-1 h-px bg-[#2d2d4e]" />
    </div>
  )
}
