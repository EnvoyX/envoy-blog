export function EmptyState({
  title,
  message,
  icon: Icon,
}: {
  title: string
  message: string
  icon: any
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/10 text-center">
      <div className="p-4 rounded-full bg-zinc-900 mb-4">
        <Icon className="size-8 text-zinc-600" />
      </div>
      <h4 className="text-lg font-semibold text-zinc-300">{title}</h4>
      <p className="text-sm text-zinc-500 max-w-[200px]">{message}</p>
    </div>
  )
}
