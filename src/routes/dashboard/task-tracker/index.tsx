import { useForm } from '@tanstack/react-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { format, intlFormatDistance } from 'date-fns';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2Icon,
  Clock,
  Layers,
  ListPlusIcon,
  ListStart,
  ListXIcon,
  Loader2,
  LogIn,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  createTaskListFn,
  deleteTaskListFn,
  fetchTaskListsFn,
  setStatusTaskListFn,
  updateTaskListFn,
} from '@/data/task-tracker';
import { taskListSchema, updateTaskListSchema } from '@/schemas/task-tracker';

export const Route = createFileRoute('/dashboard/task-tracker/')({
  head: () => ({
    meta: [
      { title: `Task Tracker | Envoy Blog` },
      {
        name: 'Envoy Blog',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: 'Task Tracker | Envoy Blog' },
      {
        property: 'og:description',
        content: 'Track your project, task, and todos!',
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [isPending, startTransition] = useTransition();

  const { data: taskLists, isPending: isPendingQuery } = useQuery({
    queryKey: ['query-task-lists'],
    queryFn: fetchTaskListsFn,
  });

  const activeTaskLists = taskLists?.filter((taskList) => taskList.active);
  const inactiveTaskLists = taskLists?.filter((taskList) => !taskList.active);

  const form = useForm({
    defaultValues: { title: '', description: '' },
    validators: { onSubmit: taskListSchema, onChange: taskListSchema },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        await createTaskListFn({ data: value });
        toast.success('Task list created!');
        void queryClient.invalidateQueries({ queryKey: ['query-task-lists'] });
        setDialogOpen(false);
        form.reset();
      });
    },
  });

  const updateForm = useForm({
    defaultValues: {
      title: '',
      description: '',
      taskListId: '',
    },
    validators: { onSubmit: updateTaskListSchema, onChange: updateTaskListSchema },
    onSubmit: async ({ value }) => {
      startTransition(async () => {
        await updateTaskListFn({ data: value });
        toast.success('Task list updated!');
        void queryClient.invalidateQueries({ queryKey: ['query-task-lists'] });
        setDialogOpen(false);
        form.reset();
      });
    },
  });

  return (
    <div className="min-h-screen  text-zinc-100 max-sm:p-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            Task Tracker
          </h1>
          <p className="text-zinc-400 mt-2">Manage your projects, tasks and todos.</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 cursor-pointer">
              <Plus className="mr-2 h-4 w-4" /> Create New List
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup>
                <form.Field
                  name="title"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Study Calculus"
                          autoComplete="off"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                />
                <form.Field
                  name="description"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="My own study plan for learning Calculus"
                          autoComplete="off"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                />
              </FieldGroup>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button variant="outline" className="cursor-pointer">
                    Cancel
                  </Button>
                </DialogClose>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      className="cursor-pointer"
                      disabled={!canSubmit || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Adding list...
                        </>
                      ) : (
                        <>
                          <ListPlusIcon className="size-4" />
                          Add List
                        </>
                      )}
                    </Button>
                  )}
                />
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <main>
        {isPendingQuery ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-zinc-500 animate-pulse">Loading your tasks...</p>
          </div>
        ) : (
          <section className="flex flex-col">
            <div className="relative w-fit mb-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-white border-b-">
                Active
              </h1>
              <div className="absolute bottom-0 w-full h-0.5 bg-linear-to-r from-transparent via-emerald-500 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {activeTaskLists?.map((item) => (
                <Card
                  key={item.id}
                  className="group relative bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate pr-4">
                          {item.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700 font-normal"
                        >
                          <Layers className="mr-1 h-3 w-3" />
                          {item.tasks.length} tasks
                        </Badge>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-zinc-950 border-zinc-800 text-zinc-300"
                        >
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-zinc-800" />
                          <DropdownMenuItem
                            onClick={() => {
                              setActiveId(item.id);
                              setUpdateDialogOpen(true);
                              updateForm.setFieldValue('title', item.title);
                              updateForm.setFieldValue('description', item.description ?? '');
                            }}
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          {item.active && (
                            <DropdownMenuItem
                              onClick={async () => {
                                toast.loading('Updating Status...', {
                                  id: 'status-update',
                                });
                                await setStatusTaskListFn({
                                  data: {
                                    taskId: item.id,
                                    status: 'INACTIVE',
                                  },
                                });
                                toast.dismiss('status-update');
                                toast.success('Status Updated!');
                                queryClient.invalidateQueries({
                                  queryKey: ['query-task-lists'],
                                });
                              }}
                              className="cursor-pointer "
                            >
                              <ListXIcon className="mr-2 h-4 w-4 text-amber-400!" />
                              <span className="text-amber-400!">Set Inactive</span>
                            </DropdownMenuItem>
                          )}
                          {!item.active && (
                            <DropdownMenuItem
                              onClick={async () => {
                                toast.loading('Updating Status...', {
                                  id: 'status-update',
                                });
                                await setStatusTaskListFn({
                                  data: {
                                    taskId: item.id,
                                    status: 'ACTIVE',
                                  },
                                });
                                toast.dismiss('status-update');
                                toast.success('Status Updated!');
                                queryClient.invalidateQueries({
                                  queryKey: ['query-task-lists'],
                                });
                              }}
                              className="cursor-pointer "
                            >
                              <CheckCircle2Icon className="mr-2 h-4 w-4 text-green-400!" />
                              <span className="text-green-400!">Set Active</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setActiveId(item.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-400 focus:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Dialog
                        open={updateDialogOpen && activeId === item.id}
                        onOpenChange={() => {
                          setUpdateDialogOpen((prev) => !prev);
                          setActiveId(item.id);
                          updateForm.setFieldValue('title', item.title);
                          updateForm.setFieldValue('description', item.description ?? '');
                          updateForm.setFieldValue('taskListId', item.id);
                        }}
                      >
                        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              updateForm.setFieldValue('taskListId', item.id);
                              updateForm.handleSubmit();
                              setActiveId('');
                            }}
                          >
                            <DialogHeader className="mb-6">
                              <DialogTitle>Update Task List</DialogTitle>
                              <DialogDescription>
                                Fill form below to update the list.
                              </DialogDescription>
                            </DialogHeader>
                            <FieldGroup>
                              <updateForm.Field
                                name="taskListId"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;
                                  return (
                                    <Field data-invalid={isInvalid}>
                                      <FieldLabel htmlFor={field.name}>Task List Id</FieldLabel>
                                      <Input
                                        id={field.name}
                                        name={field.name}
                                        value={activeId}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        defaultValue={activeId}
                                        aria-invalid={isInvalid}
                                        placeholder={activeId}
                                        autoComplete="off"
                                        disabled
                                        readOnly
                                      />
                                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                  );
                                }}
                              />
                              <updateForm.Field
                                name="title"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;
                                  return (
                                    <Field data-invalid={isInvalid}>
                                      <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                                      <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        placeholder="Study Calculus"
                                        autoComplete="off"
                                      />
                                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                  );
                                }}
                              />
                              <updateForm.Field
                                name="description"
                                children={(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;
                                  return (
                                    <Field data-invalid={isInvalid}>
                                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                                      <Textarea
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        placeholder="My own study plan for learning Calculus"
                                        autoComplete="off"
                                      />
                                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                  );
                                }}
                              />
                            </FieldGroup>
                            <DialogFooter className="mt-6">
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <updateForm.Subscribe
                                selector={(state) => [state.canSubmit, state.isSubmitting]}
                                children={([canSubmit, isSubmitting]) => (
                                  <Button
                                    type="submit"
                                    disabled={!canSubmit || isSubmitting}
                                    className="cursor-pointer"
                                  >
                                    {isSubmitting ? (
                                      <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Updating...
                                      </>
                                    ) : (
                                      <>
                                        <ListStart className="size-4" />
                                        Update list
                                      </>
                                    )}
                                  </Button>
                                )}
                              />
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>

                      {/* Delete Dialog */}
                      <Dialog
                        open={deleteDialogOpen && activeId === item.id}
                        onOpenChange={() => {
                          setDeleteDialogOpen((prev) => !prev);
                          setActiveId(item.id);
                        }}
                      >
                        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                          <form
                            onSubmit={async (e) => {
                              setIsLoading(true);
                              e.preventDefault();
                              await deleteTaskListFn({
                                data: {
                                  taskListId: item.id,
                                },
                              });
                              setIsLoading(false);
                              setDeleteDialogOpen((prev) => !prev);
                              setActiveId('');
                              queryClient.invalidateQueries({
                                queryKey: ['query-task-lists'],
                              });
                            }}
                          >
                            <DialogHeader className="mb-6">
                              <DialogTitle>Delete Task List</DialogTitle>
                              <DialogDescription>
                                Are you sure to delete this task list? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="mt-6">
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                  <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <ListXIcon className="size-4" />
                                    Delete
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-6">
                    <p className="text-sm text-zinc-400 line-clamp-2 min-h-10">
                      {item.description || 'No description provided.'}
                    </p>
                  </CardContent>

                  <CardFooter className="pt-4 border-t border-zinc-800/50 flex flex-col items-start gap-2 text-[11px] text-zinc-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-3 w-3" />
                      <span>Created: {format(new Date(item.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span className="italic text-zinc-500">
                          Updated: {intlFormatDistance(new Date(item.updatedAt), new Date())}
                        </span>
                      </div>
                      <Link
                        to="/dashboard/task-tracker/$taskListId"
                        params={{ taskListId: item.id }}
                      >
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-zinc-800 hover:bg-emerald-600 hover:text-white cursor-pointer"
                        >
                          <LogIn className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}

              {!activeTaskLists?.length && (
                <div className="col-span-full border-2 border-dashed border-zinc-800 rounded-xl p-12 text-center">
                  <p className="text-zinc-500 text-lg">
                    No active task lists found. Start by creating one!
                  </p>
                </div>
              )}
            </div>
            <div className="relative w-fit mt-4 mb-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-white border-b-">
                Inactive
              </h1>
              <div className="absolute bottom-0 w-full h-0.5 bg-linear-to-r from-transparent via-red-500 to-transparent" />
            </div>
            {inactiveTaskLists && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {inactiveTaskLists?.map((item) => (
                  <Card
                    key={item.id}
                    className="group relative bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden opacity-60"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate pr-4">
                            {item.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700 font-normal"
                          >
                            <Layers className="mr-1 h-3 w-3" />
                            {item.tasks.length} tasks
                          </Badge>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-zinc-950 border-zinc-800 text-zinc-300"
                          >
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem
                              onClick={() => {
                                setActiveId(item.id);
                                setUpdateDialogOpen(true);
                              }}
                              className="cursor-pointer"
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {item.active && (
                              <DropdownMenuItem
                                onClick={async () => {
                                  toast.loading('Updating Status...', {
                                    id: 'status-update',
                                  });
                                  await setStatusTaskListFn({
                                    data: {
                                      taskId: item.id,
                                      status: 'INACTIVE',
                                    },
                                  });
                                  toast.dismiss('status-update');
                                  toast.success('Status Updated!');
                                  queryClient.invalidateQueries({
                                    queryKey: ['query-task-lists'],
                                  });
                                }}
                                className="cursor-pointer "
                              >
                                <ListXIcon className="mr-2 h-4 w-4 text-amber-400!" />
                                <span className="text-amber-400!">Set Inactive</span>
                              </DropdownMenuItem>
                            )}
                            {!item.active && (
                              <DropdownMenuItem
                                onClick={async () => {
                                  toast.loading('Updating Status...', {
                                    id: 'status-update',
                                  });
                                  await setStatusTaskListFn({
                                    data: {
                                      taskId: item.id,
                                      status: 'ACTIVE',
                                    },
                                  });
                                  toast.dismiss('status-update');
                                  toast.success('Status Updated!');
                                  queryClient.invalidateQueries({
                                    queryKey: ['query-task-lists'],
                                  });
                                }}
                                className="cursor-pointer "
                              >
                                <CheckCircle2Icon className="mr-2 h-4 w-4 text-green-400!" />
                                <span className="text-green-400!">Set Active</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setActiveId(item.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-400 focus:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Dialog
                          open={updateDialogOpen && activeId === item.id}
                          onOpenChange={() => {
                            setUpdateDialogOpen((prev) => !prev);
                            setActiveId(item.id);
                          }}
                        >
                          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                updateForm.setFieldValue('taskListId', item.id);
                                updateForm.handleSubmit();
                              }}
                            >
                              <DialogHeader className="mb-6">
                                <DialogTitle>Update Task List</DialogTitle>
                                <DialogDescription>
                                  Fill form below to update the list.
                                </DialogDescription>
                              </DialogHeader>
                              <FieldGroup>
                                <updateForm.Field
                                  name="taskListId"
                                  children={(field) => {
                                    const isInvalid =
                                      field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                      <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Task List Id</FieldLabel>
                                        <Input
                                          id={field.name}
                                          name={field.name}
                                          value={activeId}
                                          onBlur={field.handleBlur}
                                          onChange={(e) => field.handleChange(e.target.value)}
                                          defaultValue={activeId}
                                          aria-invalid={isInvalid}
                                          placeholder={activeId}
                                          autoComplete="off"
                                          disabled
                                          readOnly
                                        />
                                        {isInvalid && (
                                          <FieldError errors={field.state.meta.errors} />
                                        )}
                                      </Field>
                                    );
                                  }}
                                />
                                <updateForm.Field
                                  name="title"
                                  children={(field) => {
                                    const isInvalid =
                                      field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                      <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                                        <Input
                                          id={field.name}
                                          name={field.name}
                                          value={item.title ?? field.state.value}
                                          onBlur={field.handleBlur}
                                          onChange={(e) => field.handleChange(e.target.value)}
                                          aria-invalid={isInvalid}
                                          placeholder="Study Calculus"
                                          autoComplete="off"
                                        />
                                        {isInvalid && (
                                          <FieldError errors={field.state.meta.errors} />
                                        )}
                                      </Field>
                                    );
                                  }}
                                />
                                <updateForm.Field
                                  name="description"
                                  children={(field) => {
                                    const isInvalid =
                                      field.state.meta.isTouched && !field.state.meta.isValid;
                                    return (
                                      <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                                        <Textarea
                                          id={field.name}
                                          name={field.name}
                                          value={item.description ?? field.state.value}
                                          onBlur={field.handleBlur}
                                          onChange={(e) => field.handleChange(e.target.value)}
                                          aria-invalid={isInvalid}
                                          placeholder="My own study plan for learning Calculus"
                                          autoComplete="off"
                                        />
                                        {isInvalid && (
                                          <FieldError errors={field.state.meta.errors} />
                                        )}
                                      </Field>
                                    );
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
                                      <ListStart className="size-4" />
                                      Update list
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>

                        {/* Delete Dialog */}
                        <Dialog
                          open={deleteDialogOpen && activeId === item.id}
                          onOpenChange={() => {
                            setDeleteDialogOpen((prev) => !prev);
                            setActiveId(item.id);
                          }}
                        >
                          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                            <form
                              onSubmit={async (e) => {
                                setIsLoading(true);
                                e.preventDefault();
                                await deleteTaskListFn({
                                  data: {
                                    taskListId: item.id,
                                  },
                                });
                                setIsLoading(false);
                                setDeleteDialogOpen((prev) => !prev);
                                setActiveId('');
                                queryClient.invalidateQueries({
                                  queryKey: ['query-task-lists'],
                                });
                              }}
                            >
                              <DialogHeader className="mb-6">
                                <DialogTitle>Delete Task List</DialogTitle>
                                <DialogDescription>
                                  Are you sure to delete this task list? This action cannot be
                                  undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter className="mt-6">
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isLoading}>
                                  {isLoading ? (
                                    <>
                                      <Loader2 className="size-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <ListXIcon className="size-4" />
                                      Delete
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-6">
                      <p className="text-sm text-zinc-400 line-clamp-2 min-h-10">
                        {item.description || 'No description provided.'}
                      </p>
                    </CardContent>

                    <CardFooter className="pt-4 border-t border-zinc-800/50 flex flex-col items-start gap-2 text-[11px] text-zinc-500">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3 w-3" />
                        <span>Created: {format(new Date(item.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span className="italic text-zinc-500">
                            Updated: {intlFormatDistance(new Date(item.updatedAt), new Date())}
                          </span>
                        </div>

                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-zinc-800 hover:bg-emerald-600 hover:text-white cursor-not-allowed"
                          disabled
                        >
                          <LogIn className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}

                {/* {!inactiveTaskLists?.length && (
                <div className="col-span-full border-2 border-dashed border-zinc-800 rounded-xl p-12 text-center">
                  <p className="text-zinc-500 text-lg">
                    No inactive task lists found.
                  </p>
                </div>
              )} */}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
