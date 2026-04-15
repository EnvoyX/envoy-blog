import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { Square } from './Square'
import {
  calculateStatus,
  calculateTurns,
  calculateWinner,
} from '@/utils/tic-tac-toe'

const useGameStore = create(
  combine(
    {
      squares: Array(9).fill(null),
      xIsNext: true,
    },
    (set) => {
      return {
        setSquares: (nextSquares: any) => {
          set((state) => ({
            squares:
              typeof nextSquares === 'function'
                ? nextSquares(state.squares)
                : nextSquares,
          }))
        },
        setXisNext: (nextXisNext: any) => {
          set((state) => ({
            xIsNext:
              typeof nextXisNext === 'function'
                ? nextXisNext(state.xIsNext)
                : nextXisNext,
          }))
        },
      }
    },
  ),
)

export default function Board() {
  const xIsNext = useGameStore((state) => state.xIsNext)
  const setXisNext = useGameStore((state) => state.setXisNext)
  const squares = useGameStore((state) => state.squares)
  const setSquares = useGameStore((state) => state.setSquares)

  const player = xIsNext ? 'X' : 'O'
  const winner = calculateWinner(squares)
  const turns = calculateTurns(squares)
  const status = calculateStatus(winner, turns, player)

  function handleClick(i: number) {
    if (squares[i]) return
    const nextSquares = squares.slice()
    nextSquares[i] = player
    setSquares(nextSquares)
    setXisNext(!xIsNext)
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="mb-2">{status}</div>
      <div className="grid grid-cols-3 border border-emerald-700 h-64 w-64">
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
