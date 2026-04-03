import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'
import {
  ListPlusIcon,
  Loader2,
  MoreHorizontal,
  PencilLine,
  PlusIcon,
  Trash2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  startTransition,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'
import { useForm } from '@tanstack/react-form'
import { taskListSchema } from '@/schemas/task-tracker'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { createTaskListFn, fetchTaskListsFn } from '@/data/task-tracker'
import { useQuery } from '@tanstack/react-query'
import { intlFormat } from 'date-fns'

export const Route = createFileRoute('/dashboard/task-tracker/')({
  head: () => ({
    meta: [
      { title: `Task Tracker | Envoy Blog` },
      {
        name: 'Envoy Blog',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: 'Task Tracker | Envoy Blog' },
      { property: 'og:description', content: 'Track your tilawah progress!' },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const hasInitialized = useRef(false)
  useEffect(() => {
    if (hasInitialized.current) return

    hasInitialized.current = true
  })
  const [isPending, startTransition] = useTransition()
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
    },
    validators: {
      onSubmit: taskListSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value)
      startTransition(async () => {
        console.log('Form values: ', value)
        createTaskListFn({ data: value })
        toast.success('Task list created successfully!')
      })
      setDialogOpen((prev) => !prev)
    },
  })
  const {
    data: taskLists,
    isPending: isPendingQuery,
    isError,
  } = useQuery({
    queryKey: ['query-task-lists'],
    queryFn: async () => {
      const data = await fetchTaskListsFn()

      return data
    },
  })

  return (
    <div className="px-4 min-h-screen flex flex-col">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">{`Task Tracker`}</h1>
        <p className="text-muted-foreground">
          Update and track your {`tasks or todos`}.
        </p>
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center">
            <Dialog
              open={dialogOpen}
              onOpenChange={() => {
                setDialogOpen((prev) => !prev)
              }}
            >
              <DialogTrigger asChild>
                <Button variant={'default'}>
                  <PlusIcon />
                  <span>Create new list</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                  }}
                >
                  <DialogHeader className="mb-6">
                    <DialogTitle>New Task List</DialogTitle>
                    <DialogDescription>
                      Fill form below to create new list.
                    </DialogDescription>
                  </DialogHeader>
                  <FieldGroup>
                    <form.Field
                      name="title"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="Study Calculus"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                    <form.Field
                      name="description"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              Description
                            </FieldLabel>
                            <Textarea
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={isInvalid}
                              placeholder="My own study plan for learning Calculus"
                              autoComplete="off"
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        )
                      }}
                    />
                  </FieldGroup>
                  <DialogFooter className="mt-6">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <ListPlusIcon className="size-4" />
                          Add List
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-col border-2 rounded-lg p-4 bg-white/5">
            {isPendingQuery ? (
              <div className="text-center flex justify-center">
                <Loader2 className="size-6 animate-spin" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-4">Task List</h1>
                {taskLists ? (
                  <div className="grid grid-cols-4 max-sm:grid-cols-1 max-md:grid-cols-2 max-lg:grid-cols-3">
                    {taskLists?.map((item) => {
                      return (
                        <div
                          className="flex flex-col gap-4 bg-white/10 p-4 rounded-lg"
                          key={item.id}
                        >
                          <div className="flex flex-col ">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xl font-bold text-emerald-500">
                                {item.title}
                              </h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline">
                                    <MoreHorizontal />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuGroup>
                                    <DropdownMenuLabel>
                                      Action
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem variant="destructive">
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <p>{item.description}</p>
                            <p>
                              {intlFormat(
                                item?.createdAt as Date,
                                {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: false,
                                },
                                {
                                  locale: 'en-ID',
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center flex justify-center">
                    No task list available.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
