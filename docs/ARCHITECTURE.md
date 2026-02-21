# Life OS — System Architecture

> Technical reference for the full Life OS stack. This doc covers every layer
> from data ingestion through AI reasoning to presentation. Build phases are
> ordered at the bottom — don't skip ahead.

*Last updated: 21 Feb 2026*

---

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                         │
│         React + Vite + Canvas/D3 · 75 visualizations · 25 sec    │
├──────────────────────────────────────────────────────────────────┤
│                       AI REASONING LAYER                         │
│  Life Auditor · Drift Detection · Lever Analysis · Causal        │
│  Inference · Second-Order Modeling · Burnout Forecast             │
├──────────────────────────────────────────────────────────────────┤
│                       FORECAST LAYER                             │
│  Deterministic projections · Goal trajectory · Skill curves      │
│  Financial independence · Burnout probability · Health arc        │
├──────────────────────────────────────────────────────────────────┤
│                       COMPOSITE SCORES                           │
│  Life Momentum · Resilience · Optionality · Integrity            │
├──────────────────────────────────────────────────────────────────┤
│                       STATE ENGINE                               │
│  12 domain scores · Velocity · Volatility · Alignment · Decay    │
├──────────────────────────────────────────────────────────────────┤
│                       GOAL ENGINE                                │
│  Goals as constraint systems · Required behaviours · Temporal    │
├──────────────────────────────────────────────────────────────────┤
│                       EVENT STORE                                │
│  Immutable life_events table · Append-only · Privacy-tiered      │
├──────────────────────────────────────────────────────────────────┤
│                       INGESTION LAYER                            │
│  Health · Nutrition · Finance · Work · Social · Learning         │
│  Mental Health · Environment · Creativity · Manual · Webhooks    │
└──────────────────────────────────────────────────────────────────┘
```

### Life Domain Model

```
Person
├── Health          — biometrics, sleep, training, recovery
├── Nutrition       — fuel, macros, hydration, fasting
├── Mental Health   — mood, stress, burnout, therapy, journaling
├── Wealth          — income, expenses, investments, net worth
├── Work            — deep work, output, meetings, projects
├── Social          — relationships, network, reciprocity
├── Family          — household, partner, parenting, contact
├── Learning        — skills, reading, courses, retention
├── Creativity      — generative output, flow states, shipping
├── Environment     — location, screen time, sunlight, air quality
├── Legacy          — charity, contribution, estate, children
└── Identity        — values, alignment, decisions, integrity
```

---

## Layer 1 — Data Ingestion

Everything enters the system as an event. No direct state mutation.

### Health Sources

| Source | Method | Data Points | Phase |
|--------|--------|-------------|-------|
| Strava | OAuth 2.0 + webhook | Workouts, distance, HR, pace, type | 1 |
| Apple Health | Export/HealthKit | Sleep duration, quality, HRV, resting HR, VO2 Max, steps | 1 |
| Google Fit | REST API | Sleep, steps, workouts, calories | 2 |
| Oura / Whoop | OAuth + API | HRV, readiness score, recovery | 3 |
| CGM (Levels/Dexcom) | API | Blood glucose response, variability | 3 |
| DEXA / Body Comp | Manual entry | Muscle mass, fat mass, bone density | 3 |
| Blood Panels (SiPhox) | Manual / API | Hormones, inflammation, metabolic markers | 3 |

### Nutrition Sources

| Source | Method | Data Points | Phase |
|--------|--------|-------------|-------|
| Manual Log | In-app entry | Meals, macros, hydration, fasting windows | 1 |
| MyFitnessPal | API | Calories, macros, micronutrients, meal timing | 2 |
| Cronometer | API / CSV | Detailed micronutrient coverage, supplements | 2 |
| Apple Health Nutrition | HealthKit | Aggregated nutrition data from linked apps | 2 |

### Finance Sources

| Source | Method | Data Points | Phase |
|--------|--------|-------------|-------|
| CSV Import | Manual upload | Transactions, balances | 1 |
| Basiq (CDR) | API aggregation | CBA accounts, transactions, categories, loans | 2 |
| Broker API | OAuth | Investment positions, returns | 3 |
| Real Estate / Crypto | API / Manual | Property valuations, wallet balances | 3 |
| Tax Projection | Calculated | Effective tax rate, deduction opportunities | 3 |

### Work Sources

| Source | Method | Data Points | Phase |
|--------|--------|-------------|-------|
| Manual Log | In-app entry | Deep work blocks, project time, focus rating | 1 |
| Calendar | Google Calendar API | Meeting count, time allocation, focus-time ratio | 2 |
| Git | GitHub webhook | Commits, PRs, code output | 2 |
| Email / Slack | API (metadata only) | Message volume, response time, after-hours signals | 3 |

### Social / Relationship Sources

| Source | Method | Data Points | Phase |
|--------|--------|-------------|-------|
| Manual Log | In-app entry | Interaction log, depth rating, energy delta | 1 |
| Contacts | Contacts API | Relationship registry, Dunbar layer mapping | 2 |
| Calendar | Google Calendar API | Meeting attendees, social events | 2 |
| Call Log | Metadata only | Call frequency, duration (no content) | 3 |

### Learning Sources

| Source | Method | Data Points | Phase |
|--------|--------|-------------|-------|
| Manual Log | In-app entry | Learning sessions, topic, duration, retention | 1 |
| Kindle / Readwise | API | Books read, highlights, reading time per book | 2 |
| Anki | API / export | Spaced repetition performance, retention curves | 2 |
| Course Platforms | API / manual | Coursera/Udemy completion, certificates | 3 |
| Podcast Apps | API | Listening history, hours consumed by topic | 3 |

### Mental Health Sources

| Source | Method | Data Points | Phase |
|--------|--------|-------------|-------|
| Manual Check-in | In-app entry | Mood (valence + arousal), primary emotion, trigger | 1 |
| Journal | In-app / Day One | Free-text entries, NLP sentiment over time | 1 |
| Calm / Headspace | API | Meditation minutes, streaks, mindful minutes | 2 |
| Therapy | Calendar + manual | Sessions logged, key insights, action items | 2 |

### Environment Sources

| Source | Method | Data Points | Phase |
|--------|--------|-------------|-------|
| Manual Log | In-app entry | Location type, workspace quality | 1 |
| Screen Time | Apple Screen Time API | App usage by category, notification volume | 2 |
| RescueTime | API | Productive vs passive time, focus sessions | 2 |
| Location | Geofencing | Auto-tag home/office/gym/travel transitions | 3 |
| Air Quality | AirThings / Awair | CO2, temperature, humidity | 3 |

### Creativity Sources

| Source | Method | Data Points | Phase |
|--------|--------|-------------|-------|
| Manual Log | In-app entry | Creative session, medium, flow state, satisfaction | 1 |
| Writing Apps | Word count API | Words written (iA Writer, Obsidian, Notion) | 2 |
| GitHub (creative) | Webhook + tag | Creative repos distinguished from work repos | 2 |
| Publishing | Manual / API | Pieces shipped, platform, audience reached | 2 |

### API Endpoints

```
POST /api/webhooks/strava          # Strava event push
POST /api/webhooks/health          # Apple Health / Google Fit normalized
POST /api/webhooks/github          # Git commit events
POST /api/ingest/finance/csv       # CSV transaction upload
POST /api/ingest/finance/cdr       # CDR aggregator sync
POST /api/ingest/nutrition         # Nutrition log (manual or synced)
POST /api/ingest/learning          # Reading / course / skill events
POST /api/ingest/environment       # Screen time, location, air quality
POST /api/manual/log               # General manual event entry
POST /api/manual/mood              # Mood + energy check-in
POST /api/manual/reflection        # Journal / reflection entry
POST /api/manual/relationship      # Social interaction log
POST /api/manual/creative          # Creative session log
POST /api/manual/decision          # Decision record
```

Each endpoint normalizes input into a `LifeEvent` and appends to the event store.

---

## Layer 2 — Event Store

Single immutable table. Never edit. Never delete. Replay to reconstruct any state.

```sql
CREATE TABLE life_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    type        VARCHAR(100) NOT NULL,  -- e.g. 'workout_completed'
    source      VARCHAR(50) NOT NULL,   -- e.g. 'strava', 'manual', 'apple_health'
    domain      VARCHAR(50) NOT NULL,   -- e.g. 'health', 'wealth', 'social'
    privacy_tier SMALLINT DEFAULT 2,    -- 1=device-only, 2=encrypted-cloud, 3=aggregated
    timestamp   TIMESTAMPTZ NOT NULL,
    payload     JSONB NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_user_type ON life_events(user_id, type);
CREATE INDEX idx_events_user_time ON life_events(user_id, timestamp DESC);
CREATE INDEX idx_events_user_domain ON life_events(user_id, domain, timestamp DESC);
```

### Event Types

**Health**
- `sleep_session_logged` — duration, quality, HRV, bed/wake times
- `workout_completed` — type, duration, intensity, HR data
- `health_metric_recorded` — resting HR, VO2 Max, weight, body fat
- `blood_panel_recorded` — biomarker, value, reference range, trend
- `body_composition_recorded` — muscle mass, fat mass, bone density

**Nutrition**
- `meal_logged` — meal type, calories, protein, carbs, fat, fiber
- `hydration_logged` — ml water, caffeine mg, alcohol units
- `fast_started` — start time, intended duration
- `fast_broken` — end time, actual duration, how feeling
- `supplement_taken` — supplement name, dosage, consistency streak

**Mental Health**
- `mood_logged` — valence (-5 to +5), arousal, primary emotion, trigger
- `stress_load_logged` — source (work/financial/health/relationship), severity 1-10
- `meditation_completed` — duration, type, app source
- `therapy_session_logged` — modality, key insight, action item
- `journal_entry_created` — word count, NLP sentiment score, themes
- `burnout_indicator_logged` — cynicism, exhaustion, efficacy (self-assessed)

**Finance**
- `transaction_recorded` — amount, category, merchant, account
- `balance_snapshot` — account, balance, timestamp
- `investment_updated` — position, value, return
- `financial_decision_made` — type (investment/purchase/negotiation), amount, reasoning

**Work**
- `deep_work_completed` — duration, project, focus rating
- `meeting_attended` — duration, type, energy cost
- `project_milestone_hit` — project, milestone, progress %

**Social**
- `relationship_interaction` — contact, medium (in-person/call/text/async), duration, depth score (1-5), energy delta (+/-), initiated by
- `relationship_registered` — contact, tier (inner circle/active/dormant/acquaintance), domain tags
- `conflict_occurred` — with whom, context, resolution status, your role
- `boundary_set` — what, why, with whom
- `boundary_violated` — what was crossed, internal or external

**Learning**
- `learning_session_completed` — topic, medium (book/course/podcast/hands-on), duration, retention score, domain tag
- `book_completed` — title, author, pages, highlights count, rating
- `skill_proficiency_updated` — skill, previous level, new level (1-10), last practiced
- `skill_applied` — skill used, real-world context, outcome

**Creativity**
- `creative_session_logged` — medium (writing/music/design/code-as-craft), duration, output units, flow state achieved, satisfaction score
- `creative_work_published` — medium, platform, audience reached
- `inspiration_consumed` — type (art/music/nature/design), duration, deliberate (bool)

**Environment**
- `environment_changed` — location type (home office/coworking/cafe/outdoors/gym/travel), duration
- `screen_time_recorded` — productive hours, passive hours, notification count, by app category
- `sunlight_exposure_logged` — minutes, morning (bool)
- `air_quality_recorded` — CO2 ppm, temperature, humidity

**Goals**
- `goal_created` — target, deadline, weight, requirements
- `goal_progress_logged` — goal, metric, value
- `goal_milestone_achieved` — goal, milestone

**Cross-Cutting**
- `decision_made` — context, options considered, reasoning, confidence level (1-10)
- `commitment_created` — promise, to whom (self/other), deadline, accountability method
- `commitment_honored` — commitment ref, on time (bool), context
- `energy_level_logged` — level (1-10), time of day (AM/midday/PM)
- `routine_disrupted` — which routine, cause (travel/illness/life event), expected duration
- `routine_restored` — which routine, days disrupted, recovery actions
- `regret_logged` — what, why, category (for pattern analysis)
- `gratitude_logged` — specific entry, domain tag
- `serendipity_captured` — unexpected positive event/connection/insight

**System**
- `drift_detected` — domain, severity, delta
- `ai_review_generated` — report content, timestamp
- `reflection_submitted` — mood, energy, notes
- `score_override_applied` — domain, original score, override score, reason
- `decay_applied` — domain, data_type, staleness_days, penalty_applied

---

## Layer 3 — State Engine

Derived from events. Recalculated on write or on schedule (every 15 min). Scores decay when data goes stale.

```sql
CREATE TABLE domain_state (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    domain          VARCHAR(50) NOT NULL,
    current_score   DECIMAL(5,2),          -- 0-100
    velocity_7d     DECIMAL(5,2),          -- 7-day trend slope
    velocity_14d    DECIMAL(5,2),
    velocity_30d    DECIMAL(5,2),
    volatility_30d  DECIMAL(5,2),          -- std deviation over 30 days
    alignment       DECIMAL(5,2),          -- vs declared goals
    risk_level      VARCHAR(20),           -- low, moderate, high, critical
    data_freshness  INTERVAL,              -- time since last event in this domain
    decay_active    BOOLEAN DEFAULT FALSE, -- true if score is being penalized for staleness
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, domain)
);
```

### Domains

`health`, `nutrition`, `mental_health`, `wealth`, `work`, `social`, `family`, `learning`, `creativity`, `environment`, `legacy`, `identity`

### Scoring Formulas

**Health Score**
```
HealthScore =
    0.30 × SleepQualityIndex
  + 0.25 × TrainingConsistency
  + 0.15 × RecoveryIndex
  + 0.10 × CardiovascularTrend
  + 0.10 × NutritionCorrelation (cross-domain input from Nutrition)
  - 0.10 × VolatilityPenalty
```

**Nutrition Score**
```
NutritionScore =
    0.25 × ProteinTargetAdherence       (g/kg bodyweight target)
  + 0.20 × CalorieTargetAdherence       (within ±10% of daily target)
  + 0.20 × MicronutrientCoverage        (% of key micros hitting RDA)
  + 0.15 × MealConsistency              (eating at regular times)
  + 0.10 × HydrationAdherence           (hitting water target)
  - 0.10 × ProcessedFoodRatio
```

**Mental Health Score**
```
MentalHealthScore =
    0.25 × MoodValence7dAvg
  + 0.20 × MoodStability (1 - variance, low variance = good)
  + 0.20 × StressLoadInverse (lower cumulative stress = better)
  + 0.15 × JournalingConsistency
  + 0.10 × MeditationFrequency
  - 0.10 × BurnoutIndicators (cynicism + exhaustion + reduced efficacy)
```

**Wealth Score**
```
WealthScore =
    0.30 × SavingsRate
  + 0.25 × NetWorthVelocity
  + 0.20 × RunwayMonths (capped at 100 for 24+ months)
  + 0.15 × InvestmentGrowth
  - 0.10 × DebtRatio
```

**Work Score**
```
WorkScore =
    0.30 × DeepWorkConsistency
  + 0.25 × OutputQuality (project milestones / target)
  + 0.20 × FocusRating
  + 0.15 × ProjectCompletion
  - 0.10 × MeetingOverload (meetings > 15h/wk penalized)
```

**Social Score**
```
SocialScore =
    0.30 × InnerCircleFrequency         (seeing top 5 people regularly)
  + 0.25 × NetworkDiversityEntropy       (connections across domains)
  + 0.20 × ReciprocityRatio             (initiated vs received interactions)
  + 0.15 × NewConnectionRate            (expanding network)
  - 0.10 × DormantRelationshipPenalty   (important ties going cold)
```

**Family Score**
```
FamilyScore =
    0.30 × QualityTimeHours             (dedicated family/partner time)
  + 0.25 × ContactFrequency            (extended family, regular check-ins)
  + 0.20 × SharedExperienceDensity     (activities, meals, trips together)
  + 0.15 × RelationshipHealthReflection (self-assessed depth + satisfaction)
  - 0.10 × TimeAllocationGap           (declared family priority vs actual hours)
```

**Learning Score**
```
LearningScore =
    0.30 × LearningHoursPerWeek
  + 0.25 × RetentionScoreAvg            (spaced repetition + self-assessed)
  + 0.20 × SkillBreadthDiversity        (cross-domain learning)
  + 0.15 × DepthProgressionRate         (beginner → intermediate → advanced)
  - 0.10 × ConsumptionWithoutApplication (learning without skill_applied events)
```

**Creativity Score**
```
CreativityScore =
    0.30 × CreativeHoursPerWeek
  + 0.25 × OutputShippedRate            (finishing and publishing)
  + 0.20 × FlowStateFrequency
  + 0.15 × MediumDiversity              (exploring multiple forms)
  - 0.10 × InspirationDeficit           (all output, no intake)
```

**Environment Score**
```
EnvironmentScore =
    0.25 × DeepWorkEnvironmentHours      (hours in optimized focus settings)
  + 0.20 × SunlightExposureMinutes      (morning light for circadian health)
  + 0.20 × ScreenTimeIntentionality     (productive vs passive ratio)
  + 0.15 × LocationVariety              (not stuck in one place all week)
  + 0.10 × AirQualityScore             (CO2 + temp in range)
  - 0.10 × NotificationLoadPenalty
```

**Legacy Score**
```
LegacyScore =
    0.25 × CharityContributionHours
  + 0.20 × SkillToImpactRatio           (using skills to help others)
  + 0.20 × ChildReadinessIndex          (financial + emotional prep)
  + 0.15 × KnowledgeArtifacts           (writing, open source, teaching)
  + 0.10 × EstatePlanningStatus         (will, insurance, legal docs current)
  + 0.10 × MicroPhilanthropyConsistency
```

**Identity Score**
```
IdentityScore =
    0.30 × ValueActionAlignment          (stated values vs observed behaviour)
  + 0.25 × CommitmentFollowThrough       (promises kept / promises made)
  + 0.20 × DecisionQuality              (outcomes of logged decisions over time)
  + 0.15 × PriorityTimeAlignment        (declared priorities vs time allocation)
  - 0.10 × ContradictionFrequency
```

### Velocity Calculation

```
velocity_Nd = (avg_last_N_days - avg_prior_N_days) / avg_prior_N_days × 100
```

### Volatility Calculation

```
volatility_30d = stddev(daily_scores_last_30_days)
```

High volatility (> 15) = unstable discipline. Penalizes composite score.

### Decay Functions

Scores degrade when data goes stale. This prevents phantom scores from old data.

```
decay_penalty = min(0.5, staleness_days / decay_window × max_penalty)
adjusted_score = raw_score × (1 - decay_penalty)
```

| Domain | Decay Window | Max Penalty | Notes |
|--------|-------------|-------------|-------|
| Health | 7 days | 30% | Biometrics go stale fast |
| Nutrition | 3 days | 40% | Daily input expected |
| Mental Health | 7 days | 25% | Weekly check-in minimum |
| Wealth | 30 days | 15% | Monthly refresh sufficient |
| Work | 7 days | 25% | Weekly activity expected |
| Social | 14 days | 20% | Bi-weekly interaction expected |
| Family | 14 days | 20% | Bi-weekly minimum |
| Learning | 14 days | 20% | Skill atrophy is real |
| Creativity | 21 days | 15% | Longer cycles acceptable |
| Environment | 7 days | 20% | Context changes matter |
| Legacy | 30 days | 10% | Long-horizon domain |
| Identity | 14 days | 15% | Needs regular reflection |

Skills have an independent decay model:

```
skill_decay = proficiency × (1 - e^(-days_since_practice / skill_half_life))
```

Where `skill_half_life` varies by skill type (motor skills decay slower than knowledge skills).

---

## Layer 4 — Goal Engine

Goals are constraint systems, not todo items.

```sql
CREATE TABLE goals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    title               VARCHAR(255) NOT NULL,
    domain              VARCHAR(50) NOT NULL,
    target_metric       VARCHAR(100),
    target_value        DECIMAL(10,2),
    current_value       DECIMAL(10,2),
    deadline            DATE,
    weight              DECIMAL(3,2) DEFAULT 1.0,  -- priority weight
    temporal_horizon    VARCHAR(20) NOT NULL,       -- tactical, strategic, existential
    status              VARCHAR(20) DEFAULT 'active',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE goal_requirements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id     UUID NOT NULL REFERENCES goals(id),
    behaviour   VARCHAR(255) NOT NULL,        -- e.g. 'training_sessions_per_week >= 4'
    metric      VARCHAR(100) NOT NULL,
    operator    VARCHAR(10) NOT NULL,          -- >=, <=, ==, >
    threshold   DECIMAL(10,2) NOT NULL,
    current     DECIMAL(10,2)
);
```

### Temporal Horizons

Goals operate at three distinct time scales. Each has different scoring and review cadences.

| Horizon | Timeframe | Review Cadence | Question |
|---------|-----------|---------------|----------|
| Tactical | Daily / Weekly | Daily | Did I do the things today? |
| Strategic | Monthly / Quarterly | Weekly | Am I moving in the right direction? |
| Existential | Annual / Multi-year | Monthly | Am I building the life I actually want? |

Most personal tracking systems only operate at tactical. Life OS must zoom out.

### Goal Alignment Score

```
GoalAlignment = (CurrentTrajectory / RequiredTrajectory) × Weight
```

If alignment < 0.7 → flagged as at-risk.
If alignment < 0.4 → flagged as failing.

---

## Layer 5 — Composite Scores (Cross-Domain)

Individual domain scores tell you where you stand. Composite scores tell you where you're heading and how robust your position is.

### Life Momentum Score

The single most important number. Not where you are — which direction you're moving.

```
LifeMomentum =
    0.12 × health_velocity_14d
  + 0.10 × nutrition_velocity_14d
  + 0.10 × mental_health_velocity_14d
  + 0.12 × wealth_velocity_14d
  + 0.12 × work_velocity_14d
  + 0.08 × social_velocity_14d
  + 0.08 × family_velocity_14d
  + 0.10 × learning_velocity_14d
  + 0.06 × creativity_velocity_14d
  + 0.04 × environment_velocity_14d
  + 0.04 × legacy_velocity_14d
  + 0.04 × identity_velocity_14d
```

Positive = life is compounding. Negative = life is eroding.

### Resilience Score

How well your system handles shocks.

```
ResilienceScore =
    0.25 × RecoverySpeed            (avg days to restore routine after disruption)
  + 0.20 × FinancialRunway          (months of expenses covered)
  + 0.20 × RelationshipSupportDensity (inner circle size × contact frequency)
  + 0.20 × HealthBuffer             (VO2 max headroom above baseline needs)
  + 0.15 × MoodRecoveryTime         (days to return to baseline after negative event)
```

### Optionality Score

How many degrees of freedom you have.

```
OptionalityScore =
    0.25 × FinancialIndependenceRatio  (passive income / expenses)
  + 0.25 × SkillPortability           (skills applicable across N industries)
  + 0.20 × GeographicFlexibility      (remote-capable, no location locks)
  + 0.15 × RelationshipNetworkBreadth (connections across domains + geographies)
  + 0.15 × TimeAutonomy               (% of time you control vs committed)
```

### Integrity Score

Are you doing what you say you will do?

```
IntegrityScore =
    0.35 × CommitmentFollowThrough     (commitments honored / commitments made)
  + 0.30 × ValueActionAlignment        (stated values vs observed behaviour)
  + 0.35 × PriorityTimeAlignment       (declared priorities vs actual time allocation)
```

This is the anti-self-deception metric.

---

## Layer 6 — Forecast Layer

Deterministic projections first. ML added only when personal data is sufficient.

### Numeric Target Projection

```
ProjectedValue = CurrentValue + (TrendSlope × RemainingWeeks)
WeeksToTarget = (TargetValue - CurrentValue) / TrendSlope
```

### Success Probability

```
SuccessProbability = AdherenceRate × StabilityIndex × ResourceSufficiency
```

Where:
- `AdherenceRate` = % of required behaviours met over last 30 days
- `StabilityIndex` = 1 - (volatility / 100)
- `ResourceSufficiency` = 1.0 if resources available, scaled down otherwise

### Long-Term Models

**Wealth projection:**
```
FutureNetWorth = CurrentNetWorth × (1 + growth_rate)^years + (annual_savings × years)
```

**Financial independence date:**
```
FI_Date = today + months_until(passive_income >= essential_expenses)

Inputs:
  - Income growth trajectory (from work domain velocity)
  - Expense pattern analysis (lifestyle inflation detection)
  - Investment return assumptions (Monte Carlo for range)
  - Major life event costs (children, housing, education from Legacy domain)

Output: Date range (optimistic / base / pessimistic)
```

**Health capacity:**
```
HealthCapacity = Baseline - (AgeDecayRate × years) + TrainingOffset
```

**Health trajectory projection:**
```
At current trends, project:
  - VO2 Max at age 40/50/60/70
  - Cardiovascular risk trajectory
  - Metabolic health forecast
Compare against population baselines.
```

**Child readiness:**
```
ReadinessAge = current_age + (required_savings - current_savings) / annual_savings_rate
```

**Skill acquisition curves:**
```
TimeToTarget = base_time × (1 - transfer_coefficient) / (practice_hours_daily × retention_rate)

Where:
  - base_time = estimated hours to proficiency for this skill type
  - transfer_coefficient = similarity to existing skills (0-1)
  - practice_hours_daily = allocated time
  - retention_rate = from spaced repetition performance data
```

**Knowledge compound interest:**
```
Skills that build on each other show accelerating returns.
CompoundKnowledge = base_learning_rate × (1 + related_skill_bonus)^connected_skills
```

**Burnout probability forecast:**
```
BurnoutProbability_Nd =
    0.25 × WorkloadTrend30d
  + 0.25 × SleepQualityDecline14d
  + 0.20 × MoodVolatilityIncrease14d
  + 0.15 × ExerciseFrequencyDecline14d
  + 0.15 × SocialIsolationSignal14d

Output: Probability at 30, 60, 90 days.
Trained on personal historical patterns of decline.
```

**Relationship investment returns:**
```
Rank relationships by predicted mutual value:
  - Interaction frequency trend
  - Reciprocity score
  - Domain alignment with current goals
  - Historical correlation (which relationships preceded life improvements)
```

---

## Layer 7 — AI Reasoning Layer

Not a chatbot. A **Life Auditor** that runs on schedule and on triggers.

### Execution Cadence

| Trigger | Action |
|---------|--------|
| Sunday 8am | Weekly Intelligence Brief |
| Domain velocity < -5% for 14 days | Drift Alert |
| Goal alignment < 0.4 | Goal Risk Alert |
| New event contradicts declared priority | Contradiction Detection |
| Burnout probability > 60% | Burnout Warning |
| Quarterly boundary | Quarterly Strategic Review |
| On demand | Full State Analysis |

### AI Input Package

The AI receives structured context, not raw events:

```json
{
  "domain_scores": {
    "health": 72, "nutrition": 65, "mental_health": 58,
    "wealth": 55, "work": 78, "social": 61,
    "family": 70, "learning": 48, "creativity": 42,
    "environment": 66, "legacy": 35, "identity": 71
  },
  "composite_scores": {
    "life_momentum": 3.2,
    "resilience": 64,
    "optionality": 52,
    "integrity": 78
  },
  "domain_velocity": { "health": -2.1, "wealth": 1.3, "..." : "..." },
  "domain_volatility": { "health": 8.2, "wealth": 3.1, "..." : "..." },
  "decay_warnings": ["creativity: 18 days stale", "legacy: 25 days stale"],
  "goal_alignment": [
    { "goal": "Scratch Golf", "alignment": 0.65, "risk": "moderate", "horizon": "strategic" }
  ],
  "forecast_summary": {
    "health_6mo": 68,
    "wealth_6mo": 62,
    "burnout_30d_probability": 0.35,
    "fi_date_base": "2034-06",
    "goal_projections": ["..."]
  },
  "recent_events_summary": "3 workouts, 6.2h avg sleep, 2 deep work blocks, 0 creative sessions",
  "declared_priorities": ["Health", "Work", "Legacy"],
  "identified_patterns": ["sleep drops after high-meeting days"],
  "life_stage": "accumulation",
  "cross_domain_correlations": [
    { "cause": "meetings > 4h/day", "effect": "HRV drops 15% within 48h", "lag": "2 days" }
  ]
}
```

### AI Functions

1. **Drift Detection** — velocity negative + high-priority domain → alert
2. **Contradiction Detection** — declared priority vs observed behaviour gap. "You say family is #1 but logged 4.2h/week vs 52h work for 3 consecutive months."
3. **Dominant Lever** — which 10% improvement yields max composite score gain. "If you increase sleep by 45 min, total alignment increases 6.4%."
4. **Erosion Pattern** — conditions under which specific goals get abandoned
5. **Cross-Domain Causal Inference** — not just correlation but personalized causal models. "Your HRV drops 15% within 48h of exceeding 4h meetings. This precedes a productivity drop 2 days later. Recommend: cap meeting days at 3.5h." Uses time-series causal analysis (Granger causality, Bayesian networks).
6. **Second-Order Effect Modeling** — "If you accept this 60h/week role: +40% income, -30% health, -25% social, -50% creative output. Net momentum: -8% despite income gain."
7. **Diminishing Returns Detection** — "Health at 92+ for 6 months. Additional effort yields marginal gains. Social at 61 is the higher-leverage target."
8. **Burnout Early Warning** — "Burnout probability at 62% within 60 days based on workload + sleep + mood trajectory. Recommend: protected recovery week."
9. **Life-Stage Contextual Weighting** — Recommendations weighted by detected life stage:
   - **Accumulation** (20s-30s): skill velocity, network expansion, financial foundation, risk capacity
   - **Leverage** (30s-40s): deepening expertise, network-to-opportunity conversion, family investment
   - **Harvest** (40s-50s): legacy building, health preservation, mentorship, wealth compounding
   - **Stewardship** (50s+): knowledge transfer, health maintenance, legacy solidification, meaning
10. **Weekly Brief** — signal, correlation of the week, per-pillar direction, uncomfortable question, one adjustment

### Weekly Intelligence Brief Format

```
THIS WEEK'S SIGNAL:
[Dominant pattern detected]

CORRELATION OF THE WEEK:
[Most statistically significant cross-domain relationship]

PILLAR STATUS:
- Health:       Compounding ↑
- Nutrition:    Stable →
- Mental:       Drifting ↓
- Wealth:       Stable →
- Work:         Volatile ↕
- Social:       Eroding ↓
- Family:       Stable →
- Learning:     Stagnant →
- Creativity:   Stale (no data 18d)
- Environment:  Improving ↑
- Legacy:       Stagnant →
- Identity:     Compounding ↑

COMPOSITE:
- Momentum:   +3.2 (positive)
- Resilience:  64 (moderate)
- Optionality: 52 (low)
- Integrity:   78 (strong)

BURNOUT RISK:
[30-day probability: 35% | 60-day: 48%]

UNCOMFORTABLE QUESTION:
[One thing the data points to that you might not want to hear]

ONE ADJUSTMENT:
[Single highest-leverage change, quantified impact estimate]
```

---

## Layer 8 — Presentation Layer (Current State)

**Stack:** React 18 + Vite + TypeScript + Tailwind v4 + Dexie.js (IndexedDB)

**Charts:** 75 visualizations across 25 sections using Canvas API + D3.js

### Visualization Inventory

| Section | Charts | Description |
|---------|--------|-------------|
| **Confrontation** | 90-Year Grid | Memento mori — 4,680 weeks |
| **Command Center** | Compounding Index | Master score + trend spark |
| **Master Views** | Life Ecosystem, Output Orbit, Impact Ripple | System health panel, project orbits, influence rings |
| **Life Gauges** | Season Dial, Freedom Meter, Drift Meter, Body Reactor | Life phase, financial runway, identity gap, energy rings |
| **Correlation Engine** | Correlation Matrix, Displacement Heatmap, Goal Erosion | Pillar connections, work/family anti-correlation, goal kill conditions |
| **Alignment** | Intelligence Spider, Alignment Compass | Radar scores, directional heading |
| **Structure** | Structural Integrity, Values Radar | Foundation health, values-to-behaviour |
| **Execution** | Habit Heatmap, Goal Timeline, Time Sankey | Completion grid, milestone progress, 168h flow |
| **Signals** | Mood/Energy Line, Alert Bars | Reflection trends, advisory alerts |
| **Drift & Entropy** | Entropy Drift Map, Future Regret Meter | Domain sparklines + arrows, week-repeat gauge |
| **Identity & Trajectory** | Identity Alignment, Trajectory Projection, Macro Life Arc | Dual spider, if-unchanged vs improved, age 20-80 curves |
| **Systems & Leverage** | Dependency Map, One Lever, Energy ROI | Cascade graph, weekly lever, activity bubbles |
| **Cognitive & Decisions** | Cognitive Heatmap, Decision Load | Multi-var overlay, fatigue point |
| **Discipline** | Habit Chain Stability, Time Bleed | Waveform consistency, leakage stacks |
| **Nutrition** | Fuel Composition Ring, Nutrition × Output Scatter, Inflammation Calendar, Depletion Signal, Meal Timing Heatmap, Nutrition Volatility, Energy Balance vs Weight, Food Environment Map | Macro rings w/ pulse, diet→output correlation, inflammatory pattern calendar, micronutrient body map, time-of-day intake heatmap, rolling variance sparklines, TDEE vs weight trend, location×spend bars |
| **Mental Health** | Psych Weather Map, Window of Tolerance, Cognitive Distortion Map, Emotional Debt Chart, Mood-Energy-Stress Triangle, State Transition Diagram, Trigger Timeline Overlay, Recovery Half-Life, Ruminations vs Action | Climate topography, arousal gauge, distortion frequency heatmap, emotional debt accumulation, triangular plot, state machine nodes, stress/mood overlay, resilience metric, overthinking vs execution |
| **Social & Relationships** | Social Portfolio, Opportunity Network, Relationship Radar, Reciprocity Balance, Connection Cadence Calendar, Resilience Network Graph, Energy After Interaction | Portfolio allocation donut, network graph w/ leverage nodes, 5-axis relationship radar, give/receive balance, interaction heatmap, trust-weighted graph, before/after scatter |
| **Causal Intelligence** | Causal Chain Renderer, Upstream/Downstream View, Causal Impact Matrix, Lagged Correlation Heatmap, Intervention Cards | Directed causal graph, hierarchical flow, input/outcome matrix, time-lag effects, before/after experiment panels |
| **Momentum** | Momentum Vector, Trajectory Delta, Momentum Vector Dial, Trajectory Bands, Win Rate vs Difficulty | Direction arrow w/ misalignment angle, 12-month derivative surface, speed+direction gauge, banded path chart, quadrant plot |
| **Knowledge & Learning** | Knowledge Compounding, Cognitive Load Meter, Knowledge Flywheel, Skill Tree Progression, Recall Strength Curve, Learning ROI | Exponential vs sawtooth curves, cognitive bandwidth tank, input→output pipeline, RPG skill nodes, spaced repetition decay, time vs output |
| **Burnout Forecast** | Burnout Pressure System, Burnout Radar, Burnout Thermometer, Load vs Recovery Phase, Red Zone Alerts, Reserves Gauge | Weather pressure map, 6-dimension Maslach radar, composite risk score, training-load life model, spike driver panel, physical/emotional/cognitive battery |
| **Data Freshness** | Data Freshness Map, Skill Atrophy Curve, Freshness Halo, Data Confidence Meter, Decay Timeline | Saturation-based freshness, neural pathway decay, metric recency rings, score+confidence pairing, input-stop score drop |
| **Temporal Views** | Zoom Stack, Seasonality View, Micro vs Macro Split | Day/week/quarter/year morph, month×year heatmap, today control + 90-day trajectory |
| **Contradiction Detection** | Contradiction Surface, Contradiction Cards, Priority vs Time Sankey, Integrity Index, Commitment Debt Ledger | Tension field map, AI-surfaced conflict cards, declared→actual flow, consistency metric, promise tracking |
| **Opportunity Pipeline** | Opportunity Pipeline | Kanban flow: introductions → conversations → collaborations → outcomes |

---

## Tech Stack

### Current (Frontend-Only)

| Component | Technology |
|-----------|-----------|
| Framework | React 18 + Vite 7 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Local DB | Dexie.js (IndexedDB) |
| Charts | Canvas API + D3.js |
| Routing | React Router v7 |
| Fonts | Inter + JetBrains Mono |

### Target (Full Stack)

| Component | Technology |
|-----------|-----------|
| Backend | FastAPI (Python 3.11+) |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis |
| Auth | Supabase Auth (or custom JWT) |
| Object Storage | Supabase Storage / S3 |
| AI | Claude API (primary) + local LLM (fallback) |
| Task Queue | Celery (state recalculation, AI briefs) |
| Hosting | Railway / Fly.io / self-host |

---

## Security & Privacy

### Privacy Tiers

Not all life data is created equal. The architecture enforces tiered storage:

| Tier | Storage | Data Types | Shareable |
|------|---------|-----------|-----------|
| **Tier 1 — Device Only** | On-device (IndexedDB / encrypted local) | Mental health entries, journal content, relationship details, location history, mood logs | Never leaves device |
| **Tier 2 — Encrypted Cloud** | AES-256 encrypted, user-keyed | Financial data, health biometrics, work metrics, nutrition, goals | Only with explicit user action |
| **Tier 3 — Aggregated** | Encrypted cloud, derived scores only | Domain scores, velocity, composite scores, trend data | Can share with coach/partner without raw data |

### Core Principles

- End-to-end encryption at rest (AES-256)
- User-owned data — full export at any time
- No data resale, no ads, no telemetry
- Self-host option for maximum sovereignty
- OAuth tokens encrypted and scoped to minimum permissions
- CDR finance access via accredited intermediary only (Basiq)

### Manual Override & Calibration

The system must allow the user to override any score or forecast with qualitative context. Without this, the system becomes a tyrannical scorekeeper rather than a tool for sovereignty.

```sql
CREATE TABLE score_overrides (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    domain      VARCHAR(50) NOT NULL,
    original    DECIMAL(5,2),
    override    DECIMAL(5,2),
    reason      TEXT NOT NULL,  -- "Net worth dropped 20% — deliberate business investment"
    expires_at  TIMESTAMPTZ,   -- override auto-expires to prevent permanent gaming
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Anti-Optimization Safeguards

Goodhart's Law: once you measure it, you start gaming the metric instead of improving the reality.

- **Periodic metric hiding** — optional "blind week" mode that hides all scores, forces living without the dashboard
- **Qualitative check-ins** — ungameable questions injected periodically: "Are you happy?", "Are you proud of this week?", "Would you be comfortable if someone you respect saw your last 7 days?"
- **Unmeasured time blocks** — protected calendar blocks explicitly excluded from tracking. Not everything should be measured.
- **Score cap warnings** — when any domain exceeds 90 for extended periods, flag diminishing returns and suggest redirecting effort

---

## Build Phases

### Phase 1 — Personal Core (Current + Next)

- [x] Frontend presentation layer (75 charts across 25 sections)
- [x] Local Dexie database for manual entry
- [x] Identity setup, goals, habits, reflections
- [ ] Event store schema (Postgres) with privacy tiers
- [ ] State engine with scoring formulas (all 12 domains)
- [ ] Decay functions for stale data
- [ ] Strava OAuth + webhook ingestion
- [ ] Apple Health export ingestion
- [ ] Manual mood + energy check-ins (mental health baseline)
- [ ] Manual nutrition logging
- [ ] Basic AI drift alerts (Claude API)

### Phase 2 — Intelligence Layer

- [ ] Full state engine with velocity/volatility
- [ ] Goal engine with constraint checking + temporal horizons
- [ ] Composite scores (momentum, resilience, optionality, integrity)
- [ ] Forecast layer (deterministic projections)
- [ ] Burnout probability forecast
- [ ] Weekly AI Intelligence Brief (all 12 pillars + composites)
- [ ] Finance CSV import + scoring
- [ ] Calendar API integration
- [ ] Manual relationship/social logging
- [ ] Manual learning session logging
- [ ] Manual creative session logging

### Phase 3 — External Integrations

- [ ] CDR finance via Basiq
- [ ] Google Fit integration
- [ ] GitHub webhook for work output
- [ ] Oura/Whoop for recovery data
- [ ] MyFitnessPal / Cronometer nutrition sync
- [ ] Kindle / Readwise reading data
- [ ] Apple Screen Time / RescueTime
- [ ] Calm/Headspace meditation data
- [ ] Legacy simulation engine (child readiness, charity)
- [ ] Score override & calibration system

### Phase 4 — AI Deep Integration

- [ ] Cross-domain causal inference engine (Granger causality)
- [ ] Contradiction detection (declared priority vs behaviour)
- [ ] Second-order effect modeling
- [ ] Diminishing returns detection
- [ ] Life-stage-aware recommendation weighting
- [ ] Erosion pattern recognition
- [ ] Quarterly strategic planning AI
- [ ] Skill acquisition curve forecasting
- [ ] Financial independence date (Monte Carlo)
- [ ] Anti-optimization safeguards (blind weeks, qualitative checks)

### Phase 5 — Advanced Integrations

- [ ] CGM blood glucose integration
- [ ] Blood panel / biomarker tracking
- [ ] DEXA body composition tracking
- [ ] Real estate / crypto asset feeds
- [ ] Tax projection engine
- [ ] Email/Slack cognitive load metrics
- [ ] Geofencing for auto-environment tagging
- [ ] Air quality sensor integration
- [ ] Anki spaced repetition sync
- [ ] Podcast listening analytics
- [ ] Personal model fine-tuning

---

## Key Principles

1. **Events are immutable** — never edit history, only append
2. **State is derived** — always recomputable from events
3. **Consistency > peaks** — volatility penalties across all scoring
4. **Goals are constraints** — not aspirations, measurable systems
5. **AI is surgical** — not motivational, pattern-recognition only
6. **User owns everything** — exportable, deletable, self-hostable
7. **Build for one first** — architect for scale, deploy for yourself
8. **Data decays** — stale scores degrade, nothing stays green without fresh input
9. **Direction > position** — momentum matters more than current score
10. **Anti-Goodhart** — the system must know when to stop measuring
11. **Privacy by design** — tiered storage, not all data treated equally
12. **Override is sovereignty** — the human always has final say over any score
