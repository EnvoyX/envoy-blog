import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getItems } from '@/data/items'
import { ItemStatus } from '@/generated/prisma/enums'
import { copyToClipboard } from '@/lib/clipboard'
import { Link, useNavigate } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { Copy, Search } from 'lucide-react'
import { toast } from 'sonner'
import z from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import { Suspense, use, useEffect, useState } from 'react'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'

const itemsSearchSchema = z.object({
  query: z.string().default(''),
  status: z.union([z.literal('all'), z.nativeEnum(ItemStatus)]).default('all'),
})

type ItemSearch = z.infer<typeof itemsSearchSchema>

export const Route = createFileRoute('/dashboard/items/')({
  head: () => ({
    meta: [
      { title: 'Saved Items | Envoy Blog' },
      {
        name: 'Envoy Blog',
        content: 'Welcome to TanStack Start playground!',
      },
      { property: 'og:title', content: 'Saved Items | Envoy Blog' },
      {
        property: 'og:description',
        content: 'View your saved items on Envoy Blog',
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
  component: RouteComponent,
  loader: () => ({ datasPromise: getItems() }),
  validateSearch: zodValidator(itemsSearchSchema),
})

function ItemsGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
        return (
          <Card key={i} className="overflow-hidden pt-0">
            <Skeleton className="aspect-video w-full" />
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="size-8 rounded-md" />
              </div>

              {/* Title */}
              <Skeleton className="h-6 w-full rounded-full" />

              {/* Author */}
              <Skeleton className="h-4 w-40 rounded-full" />
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}

function ItemLists({
  query,
  status,
  datas,
}: {
  query: ItemSearch['query']
  status: ItemSearch['status']
  datas: ReturnType<typeof getItems>
}) {
  const items = use(datas)
  const filteredDatas = items.filter((data) => {
    const matchedQuery =
      query === '' ||
      data.title?.toLowerCase().includes(query.toLowerCase()) ||
      data.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    const matchedStatus = status === 'all' || data.status === status

    return matchedQuery && matchedStatus
  })

  if (filteredDatas.length === 0) {
    return (
      <Empty className="border rounded-lg h-full">
        <EmptyHeader>
          <EmptyMedia variant={'icon'} className="bg-transparent">
            <Search className="size-10" />
          </EmptyMedia>
          <EmptyTitle>
            {items.length === 0 ? 'No Items saved yet' : 'No Items found'}
          </EmptyTitle>
          <EmptyDescription>
            {items.length === 0
              ? 'Import a URL to get started with saving your content'
              : 'No Items match your current search filters'}
          </EmptyDescription>
        </EmptyHeader>
        {items.length === 0 && (
          <EmptyContent>
            <Link
              className={buttonVariants({ variant: 'secondary' })}
              to="/dashboard/import"
            >
              Import URL
            </Link>
          </EmptyContent>
        )}
      </Empty>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-4">
      {filteredDatas.map((data) => (
        <Card
          key={data.id}
          className="group overflow-hidden transition-all hover:shadow-lg hover:scale-105 pt-0"
        >
          <Link
            to="/dashboard/items/$itemId"
            params={{ itemId: data.id }}
            className="block"
          >
            <div className="aspect-video w-full overflow-hidden bg-muted">
              <img
                src={
                  data.ogImage ?? 'https://tanstack.com/assets/og-C0HGjoLl.png'
                }
                alt={data.title ?? 'Blog Thumbnail'}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform "
              />
            </div>
            <CardHeader className="space-y-3 pt-4">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={
                    data.status === 'COMPLETED' ? 'default' : 'secondary'
                  }
                >
                  {data.status}
                </Badge>
                <Button
                  variant={'outline'}
                  size="icon"
                  className="size-8 cursor-pointer"
                  onClick={async (e) => {
                    e.preventDefault()
                    await copyToClipboard(data.url)
                    toast.success('URL copied to clipboard')
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
              <CardTitle className="line-clamp-1 text-xl leading-snug group-hover:text-primary transition-colors">
                {data.title ?? 'No Title available'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="line-clamp-3">
                {data.description ?? 'No Description available'}
              </CardDescription>
              {data.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {data.tags.map((tag) => (
                    <Badge key={tag} variant={'secondary'}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-2 mt-5">
              {data.author ? (
                <p className="text-xs text-muted-foreground">{data.author}</p>
              ) : (
                <p className="text-xs text-muted-foreground">No Author</p>
              )}
              {data.ogSiteName ? (
                <Badge variant={'secondary'}>{data.ogSiteName}</Badge>
              ) : (
                <Badge variant={'secondary'}>No Site Name</Badge>
              )}
            </CardFooter>
          </Link>
        </Card>
      ))}
    </div>
  )
}

function RouteComponent() {
  const { datasPromise } = Route.useLoaderData()
  const { status, query } = Route.useSearch()
  const [searchInput, setSearchInput] = useState(query)
  const navigate = useNavigate({ from: Route.fullPath })

  // useEffect Debounce
  useEffect(() => {
    if (searchInput === query) return
    const timeoutId = setTimeout(() => {
      navigate({
        search: (prev) => ({ ...prev, query: searchInput }),
      })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchInput, navigate, query])
  return (
    <main className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Saved Items</h1>
        <p className="text-muted-foreground">
          Your saved items and content, organized and ready for sharing.{' '}
          <a
            className="font-medium text-primary hover:underline"
            href="https://www.firecrawl.dev/app"
            target="_blank"
          >
            Powered by Firecrawl
          </a>
        </p>
      </div>

      <div className="flex gap-4">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by title or tags"
        />
        <Select
          value={status}
          onValueChange={(value) =>
            navigate({
              search: (prev) => ({ ...prev, status: value as ItemStatus }),
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.values(ItemStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Suspense fallback={<ItemsGridSkeleton />}>
        <ItemLists query={query} status={status} datas={datasPromise} />
      </Suspense>
    </main>
  )
}
