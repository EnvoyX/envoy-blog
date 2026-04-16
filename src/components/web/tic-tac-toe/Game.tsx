import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import Board from './Board'
import { Player } from '@/utils/tic-tac-toe'

const useGameStore = create(
  combine(
    {
      history: [Array(9).fill(null)],
      currentMove: 0,
    },
    (set) => {
      return {
        setHistory: (nextHistory: any) => {
          set((state) => ({
            history:
              typeof nextHistory === 'function'
                ? nextHistory(state.history)
                : nextHistory,
          }))
        },
        setCurrentMove: (nextCurrentMove: any) => {
          set((state) => ({
            currentMove:
              typeof nextCurrentMove === 'function'
                ? nextCurrentMove(state.currentMove)
                : nextCurrentMove,
          }))
        },
      }
    },
  ),
)
export default function Game() {
  const history = useGameStore((state) => state.history)
  const setHistory = useGameStore((state) => state.setHistory)
  const currentMove = useGameStore((state) => state.currentMove)
  const setCurrentMove = useGameStore((state) => state.setCurrentMove)
  const xIsNext = currentMove % 2 === 0
  const currentSquares = history[currentMove]

  function handlePlay(nextSquares: Player[]) {
    const nextHistory = history.slice(0, currentMove + 1).concat([nextSquares])
    setHistory(nextHistory)
    setCurrentMove(nextHistory.length - 1)
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove)
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-0 font-mono">
      <div>
        <Board squares={currentSquares} xIsNext={xIsNext} onPlay={handlePlay} />
      </div>
      <div className="w-full md:w-64 h-96 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm md:ml-4 overflow-y-auto">
        <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
          History
        </h2>
        <ol className="flex flex-col gap-2">
          {history.map((_, historyIndex) => {
            const isCurrent = historyIndex === currentMove
            const description =
              historyIndex > 0 ? `Move #${historyIndex}` : 'Game Start'

            return (
              <li key={historyIndex}>
                <button
                  onClick={() => jumpTo(historyIndex)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {description}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
