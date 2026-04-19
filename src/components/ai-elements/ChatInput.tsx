import { Send } from 'lucide-react'
import { memo, useState } from 'react'

interface ChatInputProps {
  onSend: (val: string) => void
  isLoading: boolean
}

export const ChatInput = memo(({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState('')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSend(input)
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative group">
      <div className="relative flex items-center transition-all duration-200 focus-within:ring-2 ring-blue-500/20 rounded-2xl">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          placeholder="Message something..."
          className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl px-4 py-4 pr-14 focus:outline-none focus:border-zinc-700 resize-none placeholder:text-zinc-600"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-3 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:bg-zinc-800 group-hover:scale-105"
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
      <p className="text-[10px] text-center text-zinc-600 mt-3 uppercase tracking-widest font-medium">
        TanStack AI + Start + Query
      </p>
    </form>
  )
})
