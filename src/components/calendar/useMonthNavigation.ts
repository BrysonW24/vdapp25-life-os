import { useState, useCallback, useRef } from 'react'
import { startOfMonth, addMonths, subMonths, format } from 'date-fns'

export function useMonthNavigation() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const touchStartX = useRef(0)

  const goNext = useCallback(() => {
    setCurrentMonth(m => addMonths(m, 1))
  }, [])

  const goPrev = useCallback(() => {
    setCurrentMonth(m => subMonths(m, 1))
  }, [])

  const goToToday = useCallback(() => {
    setCurrentMonth(startOfMonth(new Date()))
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) goNext()
      else goPrev()
    }
  }, [goNext, goPrev])

  return {
    currentMonth,
    monthLabel: format(currentMonth, 'MMMM yyyy'),
    goNext,
    goPrev,
    goToToday,
    onTouchStart,
    onTouchEnd,
  }
}
