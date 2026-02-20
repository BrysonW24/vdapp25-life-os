import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PillarSuggestion } from '@/lib/discoveryPrompts'

interface DiscoveryDrafts {
  lifeViewNotes: string[]
  lifeViewDraft: string
  workViewNotes: string[]
  workViewDraft: string
  visionNotes: string[]
  visionDraft: string
  missionNotes: string[]
  missionDraft: string
  selectedValues: string[]
  topValues: string[]
  suggestedPillars: PillarSuggestion[]
}

const EMPTY_DRAFTS: DiscoveryDrafts = {
  lifeViewNotes: [],
  lifeViewDraft: '',
  workViewNotes: [],
  workViewDraft: '',
  visionNotes: [],
  visionDraft: '',
  missionNotes: [],
  missionDraft: '',
  selectedValues: [],
  topValues: [],
  suggestedPillars: [],
}

interface DiscoveryStore {
  discoveryOpen: boolean
  openDiscovery: () => void
  closeDiscovery: () => void

  currentStep: number
  setStep: (step: number) => void

  drafts: DiscoveryDrafts
  updateDrafts: (partial: Partial<DiscoveryDrafts>) => void

  resetDiscovery: () => void
}

export const useDiscoveryStore = create<DiscoveryStore>()(
  persist(
    (set) => ({
      discoveryOpen: false,
      openDiscovery: () => set({ discoveryOpen: true }),
      closeDiscovery: () => set({ discoveryOpen: false }),

      currentStep: 0,
      setStep: (step) => set({ currentStep: step }),

      drafts: { ...EMPTY_DRAFTS },
      updateDrafts: (partial) =>
        set((state) => ({ drafts: { ...state.drafts, ...partial } })),

      resetDiscovery: () =>
        set({ discoveryOpen: false, currentStep: 0, drafts: { ...EMPTY_DRAFTS } }),
    }),
    {
      name: 'life-os-discovery',
    },
  ),
)
