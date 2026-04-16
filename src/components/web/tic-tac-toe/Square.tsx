import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function Square({
  value,
  onSquareClick,
}: {
  value: 'X' | 'O' | null
  onSquareClick: any
}) {
  const { state } = useSidebar()
  return (
    <button
      className={cn(
        'flex items-center justify-center p-0 size-24 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 transition-all border border-slate-700 text-3xl font-bold rounded-lg shadow-sm',
        {
          'md:size-16': state === 'expanded',
        },
      )}
      onClick={onSquareClick}
    >
      <span className={value === 'X' ? 'text-indigo-400' : 'text-rose-400'}>
        {value}
      </span>
    </button>
  )
}
