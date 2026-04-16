import Game from '@/components/web/tic-tac-toe/Game'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/tic-tac-toe/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 lg:p-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            Tic-Tac-Toe
          </h1>
          <p className="text-zinc-400 mt-2">
            Play Tic-Tac-Toe against the computer or human opponent.
          </p>
        </div>
      </header>
      <div className="flex justify-center items-center">
        <Game />
      </div>
    </div>
  )
}
