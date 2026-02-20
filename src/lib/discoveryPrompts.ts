// ─── Types ───────────────────────────────────────────────────────────────────

export interface DiscoveryPrompt {
  key: string
  question: string
  guidance: string
  placeholder: string
  example: string
}

export interface DiscoveryExercise {
  title: string
  intro: string
  prompts: DiscoveryPrompt[]
  synthesis: {
    instruction: string
    placeholder: string
    hint: string
    example?: string
  }
}

export interface PillarSuggestion {
  name: string
  description: string
  color: string
}

// ─── Welcome ─────────────────────────────────────────────────────────────────

export const DISCOVERY_WELCOME = {
  title: 'Discover Your Identity',
  subtitle: 'Most people don\'t have a vision statement ready to go. That\'s normal.',
  body: 'This guided process will walk you through a series of coaching exercises. There are no wrong answers. Take your time — you can leave and come back. Your progress is saved.',
  duration: '~15 minutes',
  methodology: 'Based on the Life View + Work View framework from "Designing Your Life" by Bill Burnett & Dave Evans.',
}

// ─── Life View ───────────────────────────────────────────────────────────────

export const LIFE_VIEW_EXERCISE: DiscoveryExercise = {
  title: 'Your Life View',
  intro: 'A Life View is your philosophy of life. Not what you do — what you believe. Let\'s build it one layer at a time.',

  prompts: [
    {
      key: 'lv_world',
      question: 'What do you believe is true about the world?',
      guidance: 'Think about how you see reality. Is the world fundamentally abundant or scarce? Fair or unfair? Random or purposeful? There is no right answer.',
      placeholder: 'I believe the world is...',
      example: 'The world rewards people who take ownership of their circumstances. Most suffering comes from avoiding hard truths. Connection with others is not optional — it is essential.',
    },
    {
      key: 'lv_matters',
      question: 'What matters most to you in a life well-lived?',
      guidance: 'Forget what you think you should say. If you could only optimize for 2-3 things over your entire life, what would they be?',
      placeholder: 'What matters most is...',
      example: 'Growth and mastery. Deep relationships over wide ones. Leaving something behind that outlasts me. Having the freedom to choose how I spend my days.',
    },
    {
      key: 'lv_purpose',
      question: 'Why are you here? What is the point of your existence?',
      guidance: 'This is the big one. You don\'t need a cosmic answer. "I don\'t know yet" is honest. But take a swing. What feels true right now?',
      placeholder: 'I exist to...',
      example: 'I\'m here to master a craft, raise humans who are better than me, and prove that discipline and creativity aren\'t opposites. I want to build things that matter and be fully present for the people I love.',
    },
  ],

  synthesis: {
    instruction: 'Now read back what you wrote above. Pull together the threads into 2-4 sentences that capture your Life View.',
    placeholder: 'Life is...',
    hint: 'Don\'t overthink it. You can always revise later. This is a first draft, not a tattoo.',
    example: 'Life is a finite opportunity to grow into the best version of myself. I believe the world rewards ownership and punishes avoidance. What matters most is mastery, deep connection, and freedom — in that order. I exist to build, to love fully, and to leave something behind.',
  },
}

// ─── Work View ───────────────────────────────────────────────────────────────

export const WORK_VIEW_EXERCISE: DiscoveryExercise = {
  title: 'Your Work View',
  intro: 'A Work View is your philosophy of work. Not your career plan — your relationship with work itself. What is it for?',

  prompts: [
    {
      key: 'wv_feel',
      question: 'What does good work feel like?',
      guidance: 'Think about the best working days you\'ve ever had. Not the outcomes — the feeling. What was present? What was absent?',
      placeholder: 'Good work feels like...',
      example: 'Good work feels like being in a conversation with a hard problem. Time disappears. I am challenged but not drowning. I can see my impact. Nobody is micromanaging me.',
    },
    {
      key: 'wv_flow',
      question: 'When are you in flow? What conditions produce your best output?',
      guidance: 'Flow is the state where skill meets challenge and you lose yourself in the task. When does that happen for you? What kind of work? What environment?',
      placeholder: 'I am in flow when...',
      example: 'I\'m in flow when I\'m building something from scratch — architecture, strategy, writing. I need autonomy, a clear problem, and blocks of uninterrupted time. I am worst in reactive, meeting-heavy environments.',
    },
    {
      key: 'wv_free',
      question: 'What would you do even if you were never paid for it?',
      guidance: 'Remove money from the equation entirely. You have everything you need. What work would you still do? This reveals what work means to you beyond survival.',
      placeholder: 'Even without pay, I would...',
      example: 'I would still teach, build systems, and write. I would mentor younger versions of myself. I would still solve hard problems — I just wouldn\'t sit in pointless meetings while doing it.',
    },
  ],

  synthesis: {
    instruction: 'Now combine your answers into 2-4 sentences that capture your Work View.',
    placeholder: 'I work because...',
    hint: 'Your Work View should feel honest, not aspirational. Write what is true, not what sounds impressive.',
    example: 'I work because building things is how I express myself. Good work is autonomous, creative, and aimed at hard problems. I need flow states and clear impact — without them, work becomes a slow death. Money matters, but meaning matters more.',
  },
}

// ─── Vision ──────────────────────────────────────────────────────────────────

export const VISION_EXERCISE: DiscoveryExercise = {
  title: 'Your Vision',
  intro: 'Your Vision Statement is where your Life View and Work View intersect. It describes what you are building toward — the life you are designing.',

  prompts: [
    {
      key: 'vs_10yr',
      question: 'If everything goes according to plan, what does your life look like in 10 years?',
      guidance: 'Be specific. Where do you live? What does a Tuesday look like? Who is in your life? What have you built? What have you stopped doing?',
      placeholder: 'In 10 years...',
      example: 'In 10 years I run a company of 15-30 people that solves a problem I care about. I work 5 focused hours a day. I live near the ocean. My kids are confident and curious. I am in the best shape of my life. I have deep friendships. I have financial freedom — not extravagance, but optionality.',
    },
    {
      key: 'vs_building',
      question: 'What are you building toward, right now, that matters?',
      guidance: 'Not someday. Right now. What is the arc of the next 2-5 years? What is the bridge between today and that 10-year picture?',
      placeholder: 'Right now I am building...',
      example: 'Right now I am building a consultancy that gives me leverage and cash flow. I am investing in my health infrastructure. I am deepening my relationship with my partner. I am learning AI so I can build the next thing on solid ground.',
    },
  ],

  synthesis: {
    instruction: 'Combine this into your Vision Statement. 2-3 sentences. This is your North Star.',
    placeholder: 'I am building a life where...',
    hint: 'A good vision is specific enough to guide decisions but flexible enough to survive reality.',
    example: 'I am building a life of disciplined freedom — mastery in my craft, deep connection with my family, and the financial independence to choose my own problems. I lead a lean, impactful company that solves real problems, and I am physically and mentally sharp enough to sustain it for decades.',
  },
}

// ─── Mission ─────────────────────────────────────────────────────────────────

export const MISSION_EXERCISE: DiscoveryExercise = {
  title: 'Your Mission',
  intro: 'Your Mission Statement is your 10-20 year arc. If Vision is the destination, Mission is the path you\'re walking.',

  prompts: [
    {
      key: 'ms_legacy',
      question: 'What do you want to be known for when this chapter is over?',
      guidance: 'Not fame. Impact. What will people say about your contribution? What problem did you help solve? What did you build or change?',
      placeholder: 'I want to be known for...',
      example: 'I want to be known as someone who built real things, raised good humans, and helped other people see what they were capable of. I want to be known for bridging the gap between thinking and doing.',
    },
  ],

  synthesis: {
    instruction: 'Write your Mission Statement. One bold sentence about the arc of your life\'s work.',
    placeholder: 'My mission is to...',
    hint: 'Missions are long-range. Think decades, not quarters.',
    example: 'My mission is to build technology that gives small businesses the analytical power of large ones, while raising a family that values curiosity, courage, and kindness.',
  },
}

// ─── Values ──────────────────────────────────────────────────────────────────

export const ALL_VALUES = [
  'Mastery', 'Freedom', 'Integrity', 'Impact', 'Courage',
  'Discipline', 'Creativity', 'Family', 'Health', 'Wealth',
  'Growth', 'Service', 'Wisdom', 'Authenticity', 'Excellence',
]

export const VALUES_EXERCISE = {
  title: 'Your Core Values',
  intro: 'Most people say they value everything. The exercise below forces you to choose. The constraint is the point.',

  rounds: [
    {
      instruction: 'Start by selecting the 10 values that resonate most. Remove the 5 that matter least to you.',
      target: 10,
    },
    {
      instruction: 'Now cut 3 more. This is where it gets real. What can you live without?',
      target: 7,
    },
    {
      instruction: 'Finally — which 3 of these 7 are your absolute non-negotiables? The ones you would sacrifice the others for.',
      target: 3,
    },
  ],

  closure: 'Your top 7 values will be saved to your Identity. Your top 3 are your non-negotiable core.',
}

// ─── Pillars ─────────────────────────────────────────────────────────────────

export const VALUE_TO_PILLAR: Record<string, PillarSuggestion> = {
  'Health':      { name: 'Health & Body',         description: 'Physical fitness, nutrition, sleep, energy',               color: '#059669' },
  'Family':      { name: 'Family & Relationships', description: 'Partner, children, parents, close friends',              color: '#db2777' },
  'Wealth':      { name: 'Finance & Wealth',      description: 'Income, savings, investments, financial freedom',          color: '#d97706' },
  'Mastery':     { name: 'Craft & Mastery',       description: 'Primary skill, expertise, professional growth',            color: '#7c3aed' },
  'Growth':      { name: 'Learning & Growth',     description: 'Reading, courses, mentors, expanding capability',          color: '#2563eb' },
  'Creativity':  { name: 'Creative Work',         description: 'Building, writing, designing, expressing',                 color: '#0891b2' },
  'Freedom':     { name: 'Freedom & Autonomy',    description: 'Time sovereignty, location independence, optionality',     color: '#4f46e5' },
  'Service':     { name: 'Service & Contribution', description: 'Giving back, mentoring, community impact',               color: '#059669' },
  'Discipline':  { name: 'Discipline & Systems',  description: 'Routines, habits, personal infrastructure',                color: '#dc2626' },
  'Impact':      { name: 'Impact & Legacy',       description: 'Making a dent, building something lasting',                color: '#d97706' },
  'Integrity':   { name: 'Character & Integrity', description: 'Living honestly, keeping promises, being trustworthy',     color: '#7c3aed' },
  'Excellence':  { name: 'Performance & Excellence', description: 'High standards, continuous improvement, quality output', color: '#2563eb' },
  'Wisdom':      { name: 'Wisdom & Reflection',   description: 'Thoughtful decisions, learning from experience',           color: '#0891b2' },
  'Courage':     { name: 'Courage & Risk',        description: 'Bold action, embracing discomfort, taking chances',        color: '#dc2626' },
  'Authenticity': { name: 'Authenticity & Expression', description: 'Being real, self-expression, living unfiltered',      color: '#db2777' },
}

export const DEFAULT_PILLARS: PillarSuggestion[] = [
  { name: 'Health & Body',    description: 'Physical fitness, nutrition, sleep',     color: '#059669' },
  { name: 'Finance & Wealth', description: 'Income, savings, financial freedom',     color: '#d97706' },
  { name: 'Relationships',    description: 'Partner, family, close friends',         color: '#db2777' },
  { name: 'Career & Craft',   description: 'Professional mastery and growth',        color: '#7c3aed' },
]

export const PILLARS_EXERCISE = {
  title: 'Your Life Pillars',
  intro: 'Pillars are the non-negotiable domains of your life. Based on your values, here are suggested starting pillars. Edit, add, or remove as needed.',
  instruction: 'Toggle the pillars you want to include. Add custom ones if something is missing. You can always change these later.',
}

// ─── Helper ──────────────────────────────────────────────────────────────────

export function getSuggestedPillars(values: string[]): PillarSuggestion[] {
  const seen = new Set<string>()
  const suggestions: PillarSuggestion[] = []

  for (const value of values) {
    const pillar = VALUE_TO_PILLAR[value]
    if (pillar && !seen.has(pillar.name)) {
      seen.add(pillar.name)
      suggestions.push(pillar)
    }
  }

  // If fewer than 3 suggestions, add defaults
  for (const def of DEFAULT_PILLARS) {
    if (suggestions.length >= 6) break
    if (!seen.has(def.name)) {
      seen.add(def.name)
      suggestions.push(def)
    }
  }

  return suggestions
}
