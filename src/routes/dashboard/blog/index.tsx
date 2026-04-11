import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar,
  LucideClockFading,
  ListXIcon,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getMyPostsFn, deletePostFn } from '@/data/blog'
import { toast } from 'sonner'
import { intlFormat, intlFormatDistance } from 'date-fns'
import { createStore, useStore } from '@tanstack/react-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/blog/')({
  loader: () => getMyPostsFn(),
  component: BlogPageComponent,
  head: () => ({
    meta: [
      { title: `Blog | Envoy Mindpalace` },
      {
        name: 'Envoy Mindpalace',
        content: 'Welcome to my TanStack Start playground!',
      },
      { property: 'og:title', content: 'Blog | Envoy Mindpalace' },
      {
        property: 'og:description',
        content: 'Create your own blog and write your thoughts!',
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
})

function BlogPageComponent() {
  const posts = Route.useLoaderData()
  const router = useRouter()
  const [modalStore] = useState(() =>
    createStore({
      dialogId: '',
      isOpen: false,
      isLoading: false,
    }),
  )
  const isOpen = useStore(modalStore, (state) => state.isOpen)
  const isLoading = useStore(modalStore, (state) => state.isLoading)

  //   const { unsubscribe } = modalStore.subscribe(() => {
  //     console.log('The state is now:', modalStore.state)
  //   })

  return (
    <div className="min-h-screen bg-black text-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-white to-slate-500 bg-clip-text text-transparent">
              My Collections
            </h1>
            <p className="text-slate-400 mt-2">
              Manage and curate your digital thoughts.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-500 rounded-full px-6 shadow-lg shadow-emerald-500/20"
          >
            <Link to="/dashboard/blog/create-blog" className="gap-2">
              <Plus className="size-5" />
              Create New Post
            </Link>
          </Button>
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">
              No posts found. Start your journey today!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="group relative bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col hover:scale-105 max-w-xs"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={
                    post.image ?? 'https://tanstack.com/assets/og-C0HGjoLl.png'
                  }
                  alt={post.title}
                  className="object-cover w-full h-full transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />

                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-8 rounded-full bg-slate-950/50 backdrop-blur-md border-slate-700 hover:bg-slate-800"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 bg-slate-900 border-slate-800 text-slate-200"
                    >
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer gap-2"
                      >
                        <Link
                          to="/dashboard/blog/$slug"
                          params={{ slug: post.slug }}
                        >
                          <ExternalLink className="size-4" /> View Post
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <Link
                          to="/dashboard/blog/$slug/edit"
                          params={{ slug: post.slug }}
                          className="flex gap-1"
                        >
                          <Pencil className="size-4" /> Edit Post
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          modalStore.setState((prev) => {
                            return {
                              ...prev,
                              isOpen: !prev.isOpen,
                              dialogId: post.id,
                            }
                          })
                        }}
                        className="cursor-pointer gap-2 text-red-400 focus:text-red-400 focus:bg-red-400/10"
                      >
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardContent className="p-6 flex-1">
                <div className="flex flex-col justify-center items-start sm:flex-row sm:justify-between sm:items-center">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 uppercase tracking-widest font-semibold">
                    <Calendar className="size-3" />
                    {intlFormat(new Date(post.createdAt), {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 uppercase tracking-widest font-semibold">
                    <LucideClockFading className="size-3" />
                    {intlFormatDistance(new Date(post.createdAt), new Date())}
                  </div>
                </div>
                <h2 className="text-xl font-bold leading-tight group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                  {post.description}
                </p>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button
                  asChild
                  variant="link"
                  className="p-0 h-auto text-emerald-400 hover:text-emerald-300 gap-2"
                >
                  <Link to="/dashboard/blog/$slug" params={{ slug: post.slug }}>
                    Read Full Blog →
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            modalStore.setState((prev) => {
              return {
                ...prev,
                isOpen: open,
              }
            })
          }}
        >
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
            <form
              onSubmit={async (e) => {
                modalStore.setState((prev) => {
                  return {
                    ...prev,
                    isLoading: true,
                  }
                })
                e.preventDefault()
                await deletePostFn({
                  data: {
                    postId: modalStore.state.dialogId,
                  },
                })
                toast.success('Post deleted')
                router.invalidate()
                modalStore.setState((prev) => {
                  return {
                    ...prev,
                    isLoading: false,
                    dialogId: '',
                  }
                })
                // unsubscribe()
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
    </div>
  )
}
