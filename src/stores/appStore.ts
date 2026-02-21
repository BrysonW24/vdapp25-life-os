import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LifeSeason, ReflectionType, MindsetMode, CompassMapping } from '@/types'

interface AppStore {
  // Onboarding
  onboardingComplete: boolean
  completeOnboarding: () => void

  // Season
  currentSeason: LifeSeason
  setSeason: (season: LifeSeason) => void

  // Mindset Mode
  mindsetMode: MindsetMode
  setMindsetMode: (mode: MindsetMode) => void

  // Compass
  compassMappings: CompassMapping[]
  setCompassMappings: (mappings: CompassMapping[]) => void

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

      mindsetMode: 'arena',
      setMindsetMode: (mode) => set({ mindsetMode: mode }),

      compassMappings: [],
      setCompassMappings: (mappings) => set({ compassMappings: mappings }),

      activeReflectionType: 'daily-am',
      setActiveReflectionType: (type) => set({ activeReflectionType: type }),
    }),
    {
      name: 'life-os-store',
    },
  ),
)
