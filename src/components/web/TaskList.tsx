import { useState, useTransition, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  ChevronDown,
  Calendar,
  Circle,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
  X,
  AlertTriangle,
  ListTodo,
} from 'lucide-react'
import {
  createTaskFn,
  deleteTaskFn,
  fetchTaskListByIdFn,
  updateTaskFn,
} from '@/data/task-tracker'
import { intlFormat } from 'date-fns'

type Status = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

interface Task {
  id: string
  listId: string
  userId: string
  title: string
  description?: string
  status: Status
  priority?: Priority
  dueDate?: string
  createdAt: string
  updatedAt: string
}

interface TaskList {
  id: string
  title: string
  description?: string
  tasks: Task[]
}

interface TaskFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: {
    title: string
    description: string
    status: Status
    priority: Priority
    dueDate: string
  }) => void
  initialValues?: {
    title: string
    description: string
    status: Status
    priority: Priority
    dueDate: string
    taskId?: string
  }
  mode: 'create' | 'update'
  isPending: boolean
}
interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const STATUS_CONFIG: Record<
  Status,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  TODO: {
    label: 'To Do',
    icon: <Circle className="w-3.5 h-3.5" />,
    color: 'text-zinc-400',
    bg: 'bg-zinc-800/60 border-zinc-700/50',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: <Clock className="w-3.5 h-3.5" />,
    color: 'text-sky-400',
    bg: 'bg-sky-950/60 border-sky-800/50',
  },
  DONE: {
    label: 'Done',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/60 border-emerald-800/50',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: 'text-red-400',
    bg: 'bg-red-950/60 border-red-800/50',
  },
}

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; dot: string }
> = {
  LOW: { label: 'Low', color: 'text-zinc-400', dot: 'bg-zinc-500' },
  MEDIUM: { label: 'Medium', color: 'text-amber-400', dot: 'bg-amber-400' },
  HIGH: { label: 'High', color: 'text-orange-400', dot: 'bg-orange-400' },
  URGENT: { label: 'Urgent', color: 'text-red-400', dot: 'bg-red-500' },
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium ${cfg.color} ${cfg.bg}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

function PriorityDot({ priority }: { priority?: Priority }) {
  if (!priority) return null
  const cfg = PRIORITY_CONFIG[priority]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-zinc-800/60 ${className}`} />
  )
}

function TaskListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-zinc-800/40 bg-zinc-900/40 flex flex-col gap-3"
        >
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-9 w-52" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full rounded-xl mt-2" />
      <div className="grid grid-cols-2 gap-2 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider font-mono">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 pr-8 cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-zinc-900">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
      </div>
    </div>
  )
}

function TaskFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  mode,
  isPending,
}: TaskFormModalProps) {
  const today = new Date().toISOString().split('T')[0]

  const form = useForm({
    defaultValues: initialValues ?? {
      title: '',
      description: '',
      status: 'TODO' as Status,
      priority: 'LOW' as Priority,
      dueDate: today,
    },
    onSubmit: ({ value }) => {
      onSubmit(value as any)
    },
  })

  useEffect(() => {
    if (open && initialValues) {
      form.reset(initialValues)
    } else if (open && !initialValues) {
      form.reset({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'LOW',
        dueDate: today,
      })
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-500/40 to-transparent" />
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 task-syne">
              {mode === 'create' ? 'New Task' : 'Edit Task'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {mode === 'create'
                ? 'Add a task to this list'
                : 'Update the task details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="px-6 pb-6 flex flex-col gap-4"
        >
          <form.Field name="title">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider font-mono">
                  Title
                </label>
                <input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider font-mono">
                  Description{' '}
                  <span className="normal-case text-zinc-600">(optional)</span>
                </label>
                <textarea
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Add more context..."
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 resize-none"
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-3">
            <form.Field name="status">
              {(field) => (
                <SelectField
                  label="Status"
                  value={field.state.value}
                  onChange={field.handleChange}
                  options={[
                    { value: 'TODO', label: 'To Do' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'DONE', label: 'Done' },
                    { value: 'CANCELLED', label: 'Cancelled' },
                  ]}
                />
              )}
            </form.Field>
            <form.Field name="priority">
              {(field) => (
                <SelectField
                  label="Priority"
                  value={field.state.value}
                  onChange={field.handleChange}
                  options={[
                    { value: 'LOW', label: 'Low' },
                    { value: 'MEDIUM', label: 'Medium' },
                    { value: 'HIGH', label: 'High' },
                    { value: 'URGENT', label: 'Urgent' },
                  ]}
                />
              )}
            </form.Field>
          </div>

          <form.Field name="dueDate">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider font-mono">
                  Due Date{' '}
                  <span className="normal-case text-zinc-600">(optional)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  <input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg pl-9 pr-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/30 [color-scheme:dark]"
                  />
                </div>
              </div>
            )}
          </form.Field>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-700/60 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {mode === 'create' ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteModal({
  open,
  onClose,
  onConfirm,
  isPending,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-700/60 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        <div className="h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100 task-syne">
              Delete this task?
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-2 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-700/60 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isDone = task.status === 'DONE'
  const isCancelled = task.status === 'CANCELLED'
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    !isDone &&
    !isCancelled

  return (
    <div
      className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-200
        ${
          isDone || isCancelled
            ? 'bg-zinc-900/30 border-zinc-800/40 opacity-60'
            : 'bg-zinc-900/60 border-zinc-700/50 hover:border-zinc-600/70 hover:bg-zinc-900/80'
        }`}
    >
      <div
        className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full transition-opacity
          ${
            task.status === 'DONE'
              ? 'bg-emerald-500'
              : task.status === 'IN_PROGRESS'
                ? 'bg-sky-500'
                : task.status === 'CANCELLED'
                  ? 'bg-red-500'
                  : 'bg-zinc-600'
          }
          ${isDone || isCancelled ? 'opacity-40' : 'opacity-100'}`}
      />

      <div className="flex-1 min-w-0 pl-2">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`text-sm font-medium leading-snug transition-colors
              ${isDone || isCancelled ? 'line-through text-zinc-500' : 'text-zinc-100'}`}
          >
            {task.title}
          </h3>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="p-1 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-36 bg-zinc-900 border border-zinc-700/60 rounded-xl shadow-xl shadow-black/40 overflow-hidden py-1">
                  <button
                    onClick={() => {
                      onEdit(task)
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit task
                  </button>
                  <button
                    onClick={() => {
                      onDelete(task.id)
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete task
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center flex-wrap gap-2 mt-3">
          <StatusBadge status={task.status} />
          {task.priority && <PriorityDot priority={task.priority} />}
          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-mono ${isOverdue ? 'text-red-400' : 'text-zinc-500'}`}
            >
              <Calendar className="w-3 h-3" />
              {isOverdue && '⚠ '}
              {intlFormat(
                new Date(task.dueDate) as Date,
                {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                },
                {
                  locale: 'en-US',
                },
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function DesktopSidebar({
  data,
  isPendingQuery,
  stats,
  filterStatus,
  setFilterStatus,
  tasks,
  onAdd,
}: {
  data?: TaskList
  isPendingQuery: boolean
  stats: {
    total: number
    done: number
    inProgress: number
    todo: number
    cancelled: number
  }
  filterStatus: Status | 'ALL'
  setFilterStatus: (s: Status | 'ALL') => void
  tasks: Task[]
  onAdd: () => void
}) {
  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 sticky top-12 self-start gap-5">
      {isPendingQuery ? (
        <SidebarSkeleton />
      ) : (
        <>
          <div>
            <p className="text-xs task-mono text-zinc-500 uppercase tracking-widest mb-2">
              Task List
            </p>
            <h1 className="text-2xl xl:text-3xl font-bold task-syne text-zinc-50 leading-tight">
              {data?.title}
            </h1>
            {data?.description && (
              <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                {data.description}
              </p>
            )}
          </div>

          <button
            onClick={onAdd}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-semibold transition-colors shadow-lg shadow-black/30"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>

          {stats.total > 0 && (
            <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/60 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs task-mono text-zinc-500 uppercase tracking-wider">
                  Progress
                </span>
                <span className="text-xs task-mono text-zinc-400 font-medium">
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-zinc-600 task-mono">
                {stats.done} of {stats.total} completed
              </p>
            </div>
          )}

          {stats.total > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: 'To Do',
                  value: stats.todo,
                  color: 'text-zinc-300',
                  bg: 'bg-zinc-800/40 border-zinc-700/40',
                },
                {
                  label: 'In Progress',
                  value: stats.inProgress,
                  color: 'text-sky-400',
                  bg: 'bg-sky-950/30 border-sky-800/30',
                },
                {
                  label: 'Done',
                  value: stats.done,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-950/30 border-emerald-800/30',
                },
                {
                  label: 'Cancelled',
                  value: stats.cancelled,
                  color: 'text-red-400',
                  bg: 'bg-red-950/30 border-red-800/30',
                },
              ].map(({ label, value, color, bg }) => (
                <div
                  key={label}
                  className={`p-3 rounded-xl border ${bg} flex flex-col gap-1`}
                >
                  <span className="text-xs text-zinc-500 leading-none">
                    {label}
                  </span>
                  <span className={`text-2xl font-bold task-syne ${color}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {stats.total > 0 && (
            <div>
              <p className="text-xs task-mono text-zinc-600 uppercase tracking-wider mb-2">
                Filter
              </p>
              <div className="flex flex-col gap-0.5">
                {(
                  ['ALL', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'] as const
                ).map((s) => {
                  const count =
                    s === 'ALL'
                      ? stats.total
                      : tasks.filter((t) => t.status === s).length
                  const label =
                    s === 'ALL'
                      ? 'All tasks'
                      : s === 'IN_PROGRESS'
                        ? 'In Progress'
                        : s.charAt(0) + s.slice(1).toLowerCase()
                  return (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all task-mono
                        ${
                          filterStatus === s
                            ? 'bg-zinc-700/80 text-zinc-100'
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                        }`}
                    >
                      <span>{label}</span>
                      <span
                        className={`${filterStatus === s ? 'text-zinc-400' : 'text-zinc-700'}`}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      <div className="w-16 h-16 rounded-2xl border border-dashed border-zinc-700 flex items-center justify-center">
        <CheckCircle2 className="w-7 h-7 text-zinc-600" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-400">No tasks yet</p>
        <p className="text-xs text-zinc-600 mt-1">
          Add your first task to get started
        </p>
      </div>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-sm text-zinc-300 font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add a task
      </button>
    </div>
  )
}

// Main Page

export function TaskListPage({ taskListId }: { taskListId: string }) {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const [createOpen, setCreateOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<Status | 'ALL'>('ALL')

  const { data, isPending: isPendingQuery } = useQuery({
    queryKey: ['query-task-list-id', taskListId],
    queryFn: () => fetchTaskListByIdFn({ data: { taskListId } }),
    refetchOnWindowFocus: false,
  })

  const tasks = data?.tasks ?? []
  const filtered =
    filterStatus === 'ALL'
      ? tasks
      : tasks.filter((t) => t.status === filterStatus)

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === 'DONE').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    cancelled: tasks.filter((t) => t.status === 'CANCELLED').length,
  }

  function handleCreate(values: any) {
    startTransition(async () => {
      await createTaskFn({
        data: {
          ...values,
          dueDate: new Date(values.dueDate),
          listId: taskListId,
        },
      })
      queryClient.invalidateQueries({
        queryKey: ['query-task-list-id', taskListId],
      })
      toast.success('Task created!')
      setCreateOpen(false)
    })
  }

  function handleUpdate(values: any) {
    startTransition(async () => {
      await updateTaskFn({
        data: {
          ...values,
          dueDate: new Date(values.dueDate),
          taskId: activeTask?.id as string,
        },
      })
      queryClient.invalidateQueries({
        queryKey: ['query-task-list-id', taskListId],
      })
      toast.success('Task updated!')
      setUpdateOpen(false)
      setActiveTask(null)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteTaskFn({ data: { taskId: activeTask?.id as string } })
      queryClient.invalidateQueries({
        queryKey: ['query-task-list-id', taskListId],
      })
      toast.success('Task deleted.')
      setDeleteOpen(false)
      setActiveTask(null)
    })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');
        .task-syne { font-family: 'Syne', sans-serif; }
        .task-mono { font-family: 'DM Mono', monospace; }
      `}</style>

      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex gap-10 xl:gap-16 items-start">
            <DesktopSidebar
              data={data}
              isPendingQuery={isPendingQuery}
              stats={stats}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              tasks={tasks}
              onAdd={() => setCreateOpen(true)}
            />

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {/* Mobile header — hidden on lg+ */}
              <div className="lg:hidden mb-6">
                {isPendingQuery ? (
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-80" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs task-mono text-zinc-500 uppercase tracking-widest mb-1">
                          Task List
                        </p>
                        <h1 className="text-3xl font-bold task-syne text-zinc-50 leading-tight">
                          {data?.title}
                        </h1>
                        {data?.description && (
                          <p className="text-sm text-zinc-500 mt-2 leading-relaxed max-w-md">
                            {data.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setCreateOpen(true)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-semibold transition-colors shadow-lg shadow-zinc-900/50"
                      >
                        <Plus className="w-4 h-4" />
                        New Task
                      </button>
                    </div>
                    {tasks.length > 0 && (
                      <div className="flex items-center gap-4 mt-5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-1.5 rounded-full bg-zinc-800 overflow-hidden"
                            style={{ width: 120 }}
                          >
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{
                                width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs task-mono text-zinc-500">
                            {stats.done}/{stats.total} done
                          </span>
                        </div>
                        {stats.inProgress > 0 && (
                          <span className="text-xs text-sky-400 task-mono">
                            {stats.inProgress} in progress
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Mobile filter tabs — hidden on lg+ */}
              {tasks.length > 0 && (
                <div className="lg:hidden flex items-center gap-1 mb-5 p-1 bg-zinc-900/60 rounded-xl border border-zinc-800/50 overflow-x-auto no-scrollbar">
                  {(
                    ['ALL', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'] as const
                  ).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all task-mono
                        ${filterStatus === s ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {s === 'ALL'
                        ? 'All'
                        : s === 'IN_PROGRESS'
                          ? 'In Progress'
                          : s.charAt(0) + s.slice(1).toLowerCase()}
                      {s !== 'ALL' && (
                        <span className="ml-1.5 text-zinc-600">
                          {tasks.filter((t) => t.status === s).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Desktop column header — hidden on mobile */}
              <div className="hidden lg:flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold task-syne text-zinc-200">
                    {filterStatus === 'ALL'
                      ? 'All Tasks'
                      : filterStatus === 'IN_PROGRESS'
                        ? 'In Progress'
                        : filterStatus.charAt(0) +
                          filterStatus.slice(1).toLowerCase()}
                  </h2>
                  <p className="text-xs task-mono text-zinc-600 mt-0.5">
                    {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
                <ListTodo className="w-4 h-4 text-zinc-700" />
              </div>

              {isPendingQuery ? (
                <TaskListSkeleton />
              ) : filtered.length === 0 && filterStatus !== 'ALL' ? (
                <div className="text-center py-16 text-zinc-600 text-sm task-mono">
                  No {filterStatus.toLowerCase().replace('_', ' ')} tasks.
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState onAdd={() => setCreateOpen(true)} />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {filtered.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={(t) => {
                        setActiveTask(t)
                        setUpdateOpen(true)
                      }}
                      onDelete={(id) => {
                        setActiveTask(tasks.find((t) => t.id === id) ?? null)
                        setDeleteOpen(true)
                      }}
                    />
                  ))}
                </div>
              )}

              {!isPendingQuery && tasks.length > 0 && (
                <button
                  onClick={() => setCreateOpen(true)}
                  className="mt-4 w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700 transition-all text-sm"
                >
                  <Plus className="w-4 h-4" /> Add a task
                </button>
              )}
            </main>
          </div>
        </div>
      </div>

      <TaskFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        mode="create"
        isPending={isPending}
      />

      <TaskFormModal
        open={updateOpen}
        onClose={() => {
          setUpdateOpen(false)
          setActiveTask(null)
        }}
        onSubmit={handleUpdate}
        initialValues={
          activeTask
            ? {
                title: activeTask.title,
                description: activeTask.description ?? '',
                status: activeTask.status,
                priority: activeTask.priority ?? 'LOW',
                dueDate:
                  activeTask.dueDate ?? new Date().toISOString().split('T')[0],
                taskId: activeTask.id,
              }
            : undefined
        }
        mode="update"
        isPending={isPending}
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false)
          setActiveTask(null)
        }}
        onConfirm={handleDelete}
        isPending={isPending}
      />
    </>
  )
}
