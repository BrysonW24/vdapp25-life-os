import { useState, useCallback } from 'react'
import { callClaude, getCoachKey } from '@/lib/coachApi'
import { buildCoachContext } from '@/lib/coachContext'
import { useAppStore } from '@/stores/appStore'
import type { ClaudeMessage } from '@/lib/coachApi'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  error?: boolean
}

export function useCoach() {
  const { currentSeason, mindsetMode, userName } = useAppStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (text: string) => {
    const apiKey = getCoachKey()
    if (!apiKey || !text.trim()) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const systemPrompt = await buildCoachContext(currentSeason, mindsetMode, userName)

      const history: ClaudeMessage[] = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: text.trim() },
      ]

      const reply = await callClaude(history, systemPrompt, apiKey)

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }])
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Something went wrong'
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${errorText}`,
        timestamp: new Date(),
        error: true,
      }])
    } finally {
      setIsLoading(false)
    }
  }, [messages, currentSeason, mindsetMode, userName])

  const clearHistory = useCallback(() => setMessages([]), [])

  return { messages, isLoading, sendMessage, clearHistory }
}
