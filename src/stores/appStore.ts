import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LifeSeason, ReflectionType } from '@/types'

interface AppStore {
  // Onboarding
  onboardingComplete: boolean
  completeOnboarding: () => void

  // Season
  currentSeason: LifeSeason
  setSeason: (season: LifeSeason) => void

  // UI
  activeReflectionType: ReflectionType
  setActiveReflectionType: (type: ReflectionType) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      onboardingComplete: false,
      completeOnboarding: () => set({ onboardingComplete: true }),

      currentSeason: 'foundation',
      setSeason: (season) => set({ currentSeason: season }),

      activeReflectionType: 'daily-am',
      setActiveReflectionType: (type) => set({ activeReflectionType: type }),
    }),
    {
      name: 'life-os-store',
    },
  ),
)
