import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { bulkScrapeUrl, mapUrl, scrapeUrl } from '@/data/items'
import { bulkImportSchema, singleImportSchema } from '@/schemas/import'
import { SearchResultWeb } from '@mendable/firecrawl-js'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { GlobeIcon, LinkIcon, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/import')({
    head: () => ({
        meta: [
            { title: 'Import | Envoy Blog' },
            {
                name: 'Envoy Blog',
                content: 'Welcome to TanStack Start playground!',
            },
        ],
    }),
    component: RouteComponent,
})

function RouteComponent() {
    const hasInitialized = useRef(false)
    useEffect(() => {
        if (hasInitialized.current) return

        hasInitialized.current = true
    })
    const navigate = useNavigate()
    const [isPending, startTransition] = useTransition()
    const [bulkIsPending, startBulkTransition] = useTransition()
    const [discoveredLinks, setDiscoveredLinks] = useState<Array<SearchResultWeb>>([])
    const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set())

    function handleSelectAll() {
        if (selectedLinks.size === discoveredLinks.length) {
            setSelectedLinks(new Set())

        } else {
            setSelectedLinks(new Set(discoveredLinks.map((link) => link.url)))
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
                toast.error("Please select at least one link url to import")
                return
            }
            await bulkScrapeUrl({ data: { urls: Array.from(selectedLinks) } })
            toast.success(`Bulk scrape for ${selectedLinks.size} links successful!`)
        })
    }

    const form = useForm({
        defaultValues: {
            url: "",
            prompt: "",
        },
        validators: {
            onSubmit: singleImportSchema,
        },
        onSubmit: ({ value }) => {
            console.log(value)
            toast.success("Successfully submitted")
            startBulkTransition(async () => {
                console.log("Form values: ", value)
                await scrapeUrl({ data: value })
                toast.success("URL scraped successfully!")
            })
        },
    })
    const bulkForm = useForm({
        defaultValues: {
            url: "",
            search: "",
        },
        validators: {
            onSubmit: bulkImportSchema,
        },
        onSubmit: ({ value }) => {
            console.log(value)
            toast.success("Successfully submitted")
            startBulkTransition(async () => {
                console.log("Form values: ", value)
                const data = await mapUrl({ data: value })
                toast.success("URLs scraped successfully!")
                setDiscoveredLinks(data)
            })
        },
    })

    return <section className='flex flex-1 justify-center items-center py-8'>
        <div className='w-full max-w-2xl space-y-6 px-4'>
            <div className="text-center">
                <h1 className="text-3xl font-bold">Import Content</h1>
                <p className="text-muted-foreground pt-1">Save web pages to your library or blog</p>
            </div>

            <Tabs defaultValue='single'>
                <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value="single" className='gap-2'>
                        <LinkIcon className='size-4' />
                        Single URL
                    </TabsTrigger>
                    <TabsTrigger value="bulk" className='gap-2'>
                        <GlobeIcon className='size-4' />
                        Bulk Import
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="single">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Single URL</CardTitle>
                            <CardDescription>Scrape & Save Content from any web app!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                form.handleSubmit()
                            }}>
                                <FieldGroup>
                                    <form.Field
                                        name="url"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched && !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Single URL</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="https://www.better-auth.com/"
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
                                        name="prompt"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched && !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Prompt (Optional)</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="Enter a prompt"
                                                        autoComplete="off"
                                                    />
                                                    {isInvalid && (
                                                        <FieldError errors={field.state.meta.errors} />
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />
                                    <Button type="submit" disabled={isPending}>
                                        {isPending ? (
                                            <>
                                                <Loader2 className='size-4 animate-spin' />
                                                Processing...
                                            </>
                                        ) : "Import URL"}
                                    </Button>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="bulk">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bulk Import</CardTitle>
                            <CardDescription>Discover & import multiple URLs from a website at once</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className='mb-4' onSubmit={(e) => {
                                e.preventDefault();
                                bulkForm.handleSubmit()
                            }}>
                                <FieldGroup>
                                    <bulkForm.Field
                                        name="url"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched && !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Single URL</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="https://www.better-auth.com/"
                                                        autoComplete="off"
                                                    />
                                                    {isInvalid && (
                                                        <FieldError errors={field.state.meta.errors} />
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />
                                    <bulkForm.Field
                                        name="search"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched && !field.state.meta.isValid
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Filter (Optional)</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="e.g Blog, docs, tutorial"
                                                        autoComplete="off"
                                                    />
                                                    {isInvalid && (
                                                        <FieldError errors={field.state.meta.errors} />
                                                    )}
                                                </Field>
                                            )
                                        }}
                                    />
                                    <Button type="submit" disabled={bulkIsPending}>
                                        {bulkIsPending ? (
                                            <>
                                                <Loader2 className='size-4 animate-spin' />
                                                Importing...
                                            </>
                                        ) : "Import URLs"}
                                    </Button>
                                </FieldGroup>
                            </form>
                            {/* Discovered Links */}
                            {discoveredLinks.length > 0 && (
                                <div className="space-y-4">
                                    <div className='flex items-center justify-between'>
                                        <p className='text-sm font-medium'>Found {discoveredLinks.length} links</p>
                                        <Button variant={"outline"} size={'sm'} onClick={handleSelectAll} >
                                            {selectedLinks.size === discoveredLinks.length ? "Deselect All" : "Select All"}
                                        </Button>
                                    </div>
                                    <div className='max-h-80 space-y-2 overflow-y-auto rounded-lg border p-4'>
                                        {discoveredLinks.map((link) => {
                                            return (
                                                <Label key={link.url} className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-md p-2">
                                                    <Checkbox checked={selectedLinks.has(link.url)}
                                                        onCheckedChange={() => handleSelectLink(link.url)}
                                                        className='mt-0.5 ' />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">
                                                            {link.title ?? "Title has not been found"}
                                                        </p>
                                                        <p className='truncate text-xs text-muted-foreground'>
                                                            {link.description ?? "Description has not been found"}
                                                        </p>
                                                        <p className='truncate text-xs text-muted-foreground'>
                                                            {link.url}
                                                        </p>
                                                    </div>
                                                </Label>
                                            )
                                        })}
                                    </div>
                                    <Button className='w-full' onClick={handleBulkImport} disabled={bulkIsPending} type="button">
                                        {bulkIsPending ? (
                                            <>
                                                <Loader2 className='size-4 animate-spin' />
                                                Processing...
                                            </>
                                        ) : (
                                            `Bulk Scrape ${selectedLinks.size ? selectedLinks.size : ""} links`
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

    </section>
}
