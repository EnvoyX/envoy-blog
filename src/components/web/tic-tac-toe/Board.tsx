import {
  calculateStatus,
  calculateTurns,
  calculateWinner,
  Player,
} from '@/utils/tic-tac-toe'
import { Square } from './Square'

export default function Board({
  xIsNext,
  squares,
  onPlay,
}: {
  xIsNext: boolean
  squares: Player[]
  onPlay: (nextSquares: Player[]) => void
}) {
  const winner = calculateWinner(squares)
  const turns = calculateTurns(squares)
  const player = xIsNext ? 'X' : 'O'
  const status = calculateStatus(winner, turns, player)

  function handleClick(i: number) {
    if (squares[i] || winner) return
    const nextSquares = squares.slice()
    nextSquares[i] = player
    onPlay(nextSquares)
  }

  return (
    <section className="flex flex-col items-center gap-6">
      <div
        className={`px-4 py-2 rounded-full text-sm font-semibold tracking-wide uppercase shadow-lg border ${
          winner
            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
            : 'bg-slate-800 border-slate-700 text-slate-300'
        }`}
      >
        {status}
      </div>

      <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900 rounded-xl shadow-2xl border border-slate-800">
        {squares.map((square, squareIndex) => (
          <Square
            key={squareIndex}
            value={square}
            onSquareClick={() => handleClick(squareIndex)}
          />
        ))}
      </div>
    </section>
  )
}
