export function Square({
  value,
  onSquareClick,
}: {
  value: 'X' | 'O' | null
  onSquareClick: any
}) {
  return (
    <button
      className="flex items-center justify-center p-0 size-full bg-emerald-500 border border-black rounded-none text-2xl font-bold text-white"
      onClick={onSquareClick}
    >
      {value}
    </button>
  )
}
