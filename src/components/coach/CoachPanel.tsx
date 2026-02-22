import { useState, useRef, useEffect } from 'react'
import { useCoach } from './useCoach'
import { getCoachKey, setCoachKey } from '@/lib/coachApi'
import { Bot, X, Send, Trash2, Key, ChevronRight, Brain } from 'lucide-react'
import { clsx } from 'clsx'

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-violet-400"
          style={{ animation: `heroPulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  )
}

function SetupKeyScreen({ onSave }: { onSave: () => void }) {
  const [key, setKey] = useState('')
  const [visible, setVisible] = useState(false)

  function handleSave() {
    if (!key.trim()) return
    setCoachKey(key.trim())
    onSave()
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
        <Key size={24} className="text-violet-400" />
      </div>
      <h3 className="text-sm font-semibold text-[#e8e8f0] mb-2">Connect AI Coach</h3>
      <p className="text-xs text-[#606080] mb-6 leading-relaxed">
        Enter your Anthropic API key to activate your personal Life OS coach.
        Your key is stored locally only.
      </p>
      <div className="w-full space-y-3">
        <div className="relative">
          <input
            type={visible ? 'text' : 'password'}
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="sk-ant-..."
            className="w-full rounded-xl border border-[#2d2d4e] bg-[#0f0f1a] px-3 py-2.5 pr-10 text-xs text-[#e8e8f0] placeholder:text-[#404060] focus:outline-none focus:ring-2 focus:ring-violet-500/30 font-mono text-left"
          />
          <button
            onClick={() => setVisible(!visible)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#404060] hover:text-violet-400 transition-colors"
          >
            <Key size={13} />
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium disabled:opacity-40 hover:bg-violet-500 transition-colors"
        >
          Activate Coach <ChevronRight size={14} />
        </button>
        <p className="text-[9px] text-[#404060]">
          Get your key at console.anthropic.com
        </p>
      </div>
    </div>
  )
}

export function CoachPanel() {
  const [open, setOpen] = useState(false)
  const [hasKey, setHasKey] = useState(() => !!getCoachKey())
  const [input, setInput] = useState('')
  const { messages, isLoading, sendMessage, clearHistory } = useCoach()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (open && hasKey) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, hasKey])

  async function handleSend() {
    if (!input.trim() || isLoading) return
    const text = input
    setInput('')
    await sendMessage(text)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'fixed bottom-24 right-4 lg:bottom-8 z-40 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg',
          open
            ? 'bg-violet-600 text-white'
            : 'bg-[#16162a] border border-[#2d2d4e] text-violet-400 hover:border-violet-500/50',
        )}
        style={open ? { boxShadow: '0 0 20px rgba(124,58,237,0.4)' } : undefined}
        title="AI Life Coach"
      >
        {open ? <X size={18} /> : <Bot size={18} />}
        {!open && messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] flex items-center justify-center font-bold">
            {messages.filter(m => m.role === 'assistant').length}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed right-0 top-0 bottom-0 w-full sm:w-[380px] z-50 flex flex-col border-l border-[#2d2d4e]"
          style={{
            background: 'rgba(15,15,26,0.97)',
            backdropFilter: 'blur(16px)',
            animation: 'coachSlideIn 0.2s ease-out',
          }}
        >
          {/* Panel header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2d2d4e] flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Brain size={16} className="text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#e8e8f0]">Life Coach</p>
              <p className="text-[9px] text-[#606080] font-mono">claude-sonnet-4-6 · context-aware</p>
            </div>
            <div className="flex items-center gap-1">
              {hasKey && messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="p-1.5 rounded-lg text-[#404060] hover:text-red-400 hover:bg-red-500/5 transition-colors"
                  title="Clear chat"
                >
                  <Trash2 size={14} />
                </button>
              )}
              {hasKey && (
                <button
                  onClick={() => setHasKey(false)}
                  className="p-1.5 rounded-lg text-[#404060] hover:text-violet-400 hover:bg-violet-500/5 transition-colors"
                  title="Change API key"
                >
                  <Key size={14} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-[#606080] hover:text-[#e8e8f0] hover:bg-[#1e1e35] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!hasKey ? (
            <SetupKeyScreen onSave={() => setHasKey(true)} />
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                      <Brain size={20} className="text-violet-400" />
                    </div>
                    <p className="text-sm font-semibold text-[#e8e8f0] mb-1">Your coach is ready</p>
                    <p className="text-xs text-[#606080] leading-relaxed max-w-[260px] mx-auto">
                      Ask anything about your goals, habits, identity gaps, or what to focus on next.
                    </p>
                    <div className="mt-4 space-y-2">
                      {[
                        'What should I focus on today?',
                        'Where am I most misaligned?',
                        'How\'s my habit streak looking?',
                      ].map(prompt => (
                        <button
                          key={prompt}
                          onClick={() => sendMessage(prompt)}
                          className="block w-full text-left text-xs text-[#808090] border border-[#2d2d4e] rounded-xl px-3 py-2 hover:border-violet-500/30 hover:text-violet-400 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={clsx(
                      'flex',
                      msg.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                        <Brain size={12} className="text-violet-400" />
                      </div>
                    )}
                    <div
                      className={clsx(
                        'max-w-[80%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-violet-600 text-white rounded-tr-sm'
                          : msg.error
                            ? 'bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-sm'
                            : 'bg-[#1e1e35] text-[#e8e8f0] rounded-tl-sm',
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <Brain size={12} className="text-violet-400" />
                    </div>
                    <div className="bg-[#1e1e35] rounded-2xl rounded-tl-sm">
                      <TypingIndicator />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-[#2d2d4e] px-3 py-3 flex-shrink-0">
                <div className="flex items-end gap-2 bg-[#16162a] border border-[#2d2d4e] rounded-2xl px-3 py-2 focus-within:border-violet-500/40 transition-colors">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask your coach..."
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-[#e8e8f0] placeholder:text-[#404060] resize-none focus:outline-none min-h-[24px] max-h-[120px]"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="w-7 h-7 rounded-xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-violet-500 transition-colors"
                  >
                    <Send size={13} />
                  </button>
                </div>
                <p className="text-[9px] text-[#404060] text-center mt-1.5">Enter to send · Shift+Enter for newline</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Overlay on mobile when panel open */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
