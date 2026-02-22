const COACH_KEY_STORAGE = 'life-os-coach-key'

export function getCoachKey(): string {
  return localStorage.getItem(COACH_KEY_STORAGE) ?? ''
}

export function setCoachKey(key: string): void {
  if (key) localStorage.setItem(COACH_KEY_STORAGE, key)
  else localStorage.removeItem(COACH_KEY_STORAGE)
}

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function callClaude(
  messages: ClaudeMessage[],
  systemPrompt: string,
  apiKey: string,
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `API error ${response.status}`)
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> }
  const text = data.content.find(b => b.type === 'text')?.text ?? ''
  return text
}
