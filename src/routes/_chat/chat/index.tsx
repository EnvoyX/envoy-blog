import { createFileRoute } from '@tanstack/react-router'
import { Zap, Globe, Bot } from 'lucide-react' // Optional: Install lucide-react for icons

export const Route = createFileRoute('/_chat/chat/')({
  component: RouteComponent,
})

function RouteComponent() {
  const models = [
    {
      id: 'gemini',
      name: 'Gemini',
      description:
        'Google’s multimodal powerhouse. Features 1M+ context window and native video/audio processing.',
      icon: <Bot className="w-6 h-6 text-blue-400" />,
      color: 'border-blue-500/20 hover:border-blue-500/50',
    },
    {
      id: 'groq',
      name: 'Groq',
      description:
        'Insane inference speeds powered by LPU hardware. Ideal for real-time, ultra-fast chat responses.',
      icon: <Zap className="w-6 h-6 text-orange-400" />,
      color: 'border-orange-500/20 hover:border-orange-500/50',
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      description:
        'A unified gateway to every model imaginable. Compare prices and switch models on the fly.',
      icon: <Globe className="w-6 h-6 text-cyan-400" />,
      color: 'border-cyan-500/20 hover:border-cyan-500/50',
    },
  ]

  return (
    <main className="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col gap-4 items-center justify-center px-16 max-sm:px-8 md:p-12 overflow-y-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center mt-16 mb-16 space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-emerald-600">
          Select Your Intelligence
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Choose a provider to start a new conversation. Each model is optimized
          for different workflows.
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl px-16 max-sm:px-0">
        {models.map((model) => (
          <a
            key={model.id}
            href={`chat/${model.id}`}
            className={`group relative flex flex-col p-8 max-sm:p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 ${model.color} hover:-translate-y-1`}
          >
            <div className="mb-4 p-3 rounded-lg bg-white/5 w-fit group-hover:scale-110 transition-transform max-sm:mx-auto">
              {model.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2 max-sm:mx-auto">
              {model.name}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed max-sm:text-center">
              {model.description}
            </p>

            <div className="mt-6 flex items-center text-xs font-medium text-gray-500 group-hover:text-white transition-colors max-sm:mx-auto">
              START CHATTING
              <span className="ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-20 text-gray-600 text-xs tracking-widest uppercase">
        Powered by TanStack AI
      </div>
    </main>
  )
}
