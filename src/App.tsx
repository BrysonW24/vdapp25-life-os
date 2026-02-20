import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { HubPage } from '@/pages/HubPage'
import { IdentityPage } from '@/pages/IdentityPage'
import { GoalsPage } from '@/pages/GoalsPage'
import { HabitsPage } from '@/pages/HabitsPage'
import { ReflectPage } from '@/pages/ReflectPage'
import { AdvisoryPage } from '@/pages/AdvisoryPage'
import { IntelligencePage } from '@/pages/IntelligencePage'
import { useAppStore } from '@/stores/appStore'
import { seedResources } from '@/lib/seeds'

export function App() {
  const { onboardingComplete, completeOnboarding } = useAppStore()

  useEffect(() => {
    seedResources()
  }, [])

  if (!onboardingComplete) {
    return <OnboardingFlow onComplete={completeOnboarding} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HubPage />} />
          <Route path="identity" element={<IdentityPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="reflect" element={<ReflectPage />} />
          <Route path="advisory" element={<AdvisoryPage />} />
          <Route path="intelligence" element={<IntelligencePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
