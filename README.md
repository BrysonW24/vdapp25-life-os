# Life OS

Personal operating system for goals, habits, identity, and self-improvement — built with React 19, Vite, and D3.

## Overview

Life OS is a client-side life management app that helps you define your identity pillars, set goals, build habits, reflect, and track progress. All data stays local via IndexedDB (Dexie).

## Tech Stack

- **Framework:** React 19 + Vite 7
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS 4
- **Visualizations:** D3.js + Recharts
- **Storage:** Dexie (IndexedDB) — fully offline, no backend
- **State:** Zustand 5
- **Routing:** React Router 7

## Features

- Identity discovery — define your pillars, values, and standards
- Goal setting with timeline visualization
- Habit tracking with heatmaps and streak tracking
- Daily reflections with guided prompts
- Intelligence hub with spider/radar charts
- Advisory system with severity-based alerts
- Seasonal life phases (seasons selector)
- Onboarding flow for new users
- Mood + energy line tracking
- Gap analysis engine
- Challenge engine

## Getting Started

```bash
npm install
npm run dev
```

Visit http://localhost:5173

## Project Structure

```
src/
├── components/
│   ├── calendar/          # Monthly calendar, day modals
│   ├── identity/          # Pillar + standard editors
│   ├── onboarding/        # Onboarding flow
│   ├── visualizations/    # Charts (heatmap, radar, spider, etc.)
│   └── ui/                # Shared UI primitives
├── hooks/                 # Data hooks (goals, habits, identity, etc.)
├── lib/                   # DB, seeds, engines, prompts
├── pages/                 # Route pages
├── stores/                # Zustand stores
└── types/                 # TypeScript types
```

## License

Private — Vivacity Digital
