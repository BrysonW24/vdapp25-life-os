import { useState, useEffect, useRef } from 'react'

export function useContainerSize() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setSize({ width: Math.floor(width), height: Math.floor(height) })
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { containerRef, ...size }
}
