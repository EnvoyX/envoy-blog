import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { BulkScrapeProgress, bulkScrapeUrl } from '@/data/items'
import { searchWeb } from '@/data/search'
import { searchSchema } from '@/schemas/discover'
import { SearchResultWeb } from '@mendable/firecrawl-js'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2, Search, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/discover')({
  head: () => ({
    meta: [
      { title: 'Discover | Envoy Blog' },
      {
        name: 'Envoy Blog',
        content: 'Welcome to TanStack Start playground!',
      },
      { property: 'og:title', content: 'Discover | Envoy Blog' },
      {
        property: 'og:description',
        content: 'Discover the latest news and updates from Envoy Blog.',
      },
      {
        property: 'og:image',
        content: 'https://tanstack.com/assets/og-C0HGjoLl.png',
      },
      { property: 'og:type', content: 'website' },
    ],
  }),
  component: RouteComponent,
})
// searchSchema
function RouteComponent() {
  const navigate = useNavigate()
  const [searchResult, setSearchResult] = useState<Array<SearchResultWeb>>([])
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<BulkScrapeProgress | null>(null)
  const [isPending, startTransition] = useTransition()
  const [bulkIsPending, startBulkTransition] = useTransition()
  const form = useForm({
    defaultValues: {
      query: '',
    },
    validators: {
      onSubmit: searchSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        console.log(value)
        const result = await searchWeb({ data: { query: value.query } })
        setSearchResult(result)
        toast.success(`Search completed, ${result.length} results found`)
      })
    },
  })
  function handleSelectAll() {
    if (selectedLinks.size === searchResult.length) {
      setSelectedLinks(new Set())
    } else {
      setSelectedLinks(new Set(searchResult.map((link) => link.url)))
    }
  }

  function handleSelectLink(url: string) {
    const currentSelected = new Set(selectedLinks)
    if (currentSelected.has(url)) {
      currentSelected.delete(url)
    } else {
      currentSelected.add(url)
    }
    setSelectedLinks(currentSelected)
  }

  function handleBulkImport() {
    startBulkTransition(async () => {
      if (selectedLinks.size === 0) {
        toast.error('Please select at least one link url to import')
        return
      }
      setProgress({
        completed: 0,
        total: selectedLinks.size,
        url: '',
        status: 'Progress',
      })

      let successCount = 0
      let failedCount = 0

      for await (const update of await bulkScrapeUrl({
        data: { urls: Array.from(selectedLinks) },
      })) {
        setProgress(update)
        if (update.status === 'Success') {
          successCount++
        } else {
          failedCount++
        }
      }

      setProgress(null)

      if (failedCount > 0) {
        toast.success(
          `Bulk scrape for ${successCount} links successful! (${failedCount} failed)`,
        )
      } else {
        toast.success(`Bulk scrape for ${successCount} links successful!`)
      }
    })
  }
  const hasInitialized = useRef(false)
  useEffect(() => {
    if (hasInitialized.current) return

    hasInitialized.current = true
  })
  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-2xl space-y-6 px-4 ">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Discover</h1>
          <p className="pt-2 text-muted-foreground">
            Search the web articles for any topic you interested.{' '}
            <a
              className="font-medium text-primary hover:underline"
              href="https://www.firecrawl.dev/app"
              target="_blank"
            >
              Powered by Firecrawl
            </a>
          </p>
        </div>
        <Card className="bg-transparent!">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Topic Search
            </CardTitle>
            <CardDescription>
              Search the web for content and import what you find interesting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
            >
              <FieldGroup>
                <form.Field
                  name="query"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Search Query
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="e.g TanStack Start Tutorials"
                          autoComplete="off"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
                <Button type="submit" disabled={isPending || bulkIsPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="size-4" />
                      Search
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>
            {searchResult.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Found {searchResult.length} links
                  </p>
                  <Button
                    variant={'outline'}
                    size={'sm'}
                    onClick={handleSelectAll}
                    disabled={bulkIsPending || isPending}
                  >
                    {selectedLinks.size === searchResult.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                </div>
                <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border p-4">
                  {searchResult.map((link) => {
                    return (
                      <Label
                        key={link.url}
                        className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-md p-2"
                      >
                        <Checkbox
                          checked={selectedLinks.has(link.url)}
                          onCheckedChange={() => handleSelectLink(link.url)}
                          disabled={bulkIsPending || isPending}
                          className="mt-0.5 "
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {link.title ?? 'Title has not been found'}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {link.description ??
                              'Description has not been found'}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {link.url}
                          </p>
                          {link.category && (
                            <Badge variant={'default'} className="my-1">
                              {link.category.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </Label>
                    )
                  })}
                </div>
                {progress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Importing : {progress.completed} / {progress.total}
                      </span>
                      <span className="font-medium">
                        {Math.round(
                          (progress.completed / progress.total) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(progress.completed / progress.total) * 100}
                    />
                  </div>
                )}
                <Button
                  className="w-full"
                  onClick={handleBulkImport}
                  disabled={bulkIsPending || isPending}
                  type="button"
                >
                  {bulkIsPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {progress
                        ? `Importing ${progress.completed} / ${progress.total}`
                        : 'Importing...'}
                    </>
                  ) : (
                    `Bulk Scrape ${selectedLinks.size ? selectedLinks.size : ''} links`
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
