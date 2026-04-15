type Player = 'X' | 'O'

export function calculateWinner(squares: Player[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }

  return null
}

export function calculateTurns(squares: string[]) {
  return squares.filter((square) => !square).length
}

export function calculateStatus(
  winner: 'X' | 'O' | null,
  turns: number,
  player: 'X' | 'O',
) {
  if (!winner && !turns) return 'Draw'
  if (winner) return `Winner ${winner}`
  return `Next player: ${player}`
}
