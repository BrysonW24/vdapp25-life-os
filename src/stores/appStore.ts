import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LifeSeason, ReflectionType, MindsetMode, CompassMapping } from '@/types'

export type Theme = 'dark' | 'light' | 'midnight'

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

  // Profile
  userName: string
  setUserName: (name: string) => void

  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void
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

      compassMappings: [] as CompassMapping[],
      setCompassMappings: (mappings) => set({ compassMappings: mappings }),

      activeReflectionType: 'daily-am',
      setActiveReflectionType: (type) => set({ activeReflectionType: type }),

      userName: '',
      setUserName: (name) => set({ userName: name }),

      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'life-os-store',
    },
  ),
)
