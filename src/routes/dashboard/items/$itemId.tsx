import { MessageResponse } from '@/components/ai-elements/message'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { getItemById, saveSummaryAndGenerateTags } from '@/data/items'
import { cn } from '@/lib/utils'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Calendar, ChevronDown, Clock, ExternalLink, Loader2, Sparkles, User } from 'lucide-react'
import { useState } from 'react'
import { useCompletion } from "@ai-sdk/react"
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/items/$itemId')({
    component: RouteComponent,
    loader: ({ params }) => getItemById({ data: { itemId: params.itemId } }),
    head: ({ loaderData }) => ({
        meta: [
            { title: `${loaderData?.title ?? "Untitled Item"} | Envoy Blog` },
            {
                name: "description",
                content: loaderData?.description ?? "No description available"
            },
            // Open Graph
            { property: 'og:title', content: loaderData?.title ?? "Untitled Item" },
            { property: 'og:description', content: loaderData?.description ?? "No description available" },
            { property: 'og:image', content: loaderData?.ogImage ?? "https://tanstack.com/assets/og-C0HGjoLl.png" },
            { property: 'og:type', content: 'article' },
        ]

    })
})

function RouteComponent() {
    const data = Route.useLoaderData()
    const router = useRouter()
    const { completion, complete, isLoading } = useCompletion({
        api: "/api/ai/summary",
        initialCompletion: data.summary ? data.summary : undefined,
        streamProtocol: "text",
        body: {
            itemId: data.id,
        },
        onError(error) {
            toast.error(error.message)
        },
        onFinish(_prompt, completionText) {
            saveSummaryAndGenerateTags({
                data: {
                    itemId: data.id,
                    summary: completionText
                }
            })
            toast.success("Summary generated and saved successfully!")
            router.invalidate()
        }
    })
    const [contentOpen, setContentOpen] = useState(false)

    function handleGenerateSummary() {
        if (!data.content) {
            toast.error("No content to generate summary for.")
            return
        }
        complete(data.content)
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6 w-full">
            <div className='flex justify-start items-center gap-2'>
                <Link to="/dashboard/items" className={buttonVariants({ variant: "outline" })}>
                    <ArrowLeft />
                    Go Back
                </Link>
            </div>
            <div className='relative aspect-video w-full rounded-lg bg-muted overflow-hidden'>
                <img src={data?.ogImage ?? "https://tanstack.com/assets/og-C0HGjoLl.png"} alt={data?.title ?? "ItemId Title"} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"></img>
            </div>
            <div className='space-y-3 flex flex-wrap items-center justify-between'>
                <h1 className="text-3xl font-bold tracking-tight">{data?.title ?? "Untitled"}</h1>
                {data?.ogSiteName && (
                    <Badge variant={"default"} >
                        {data.ogSiteName}
                    </Badge>
                )}
            </div>
            <div className='flex flex-wrap items-center justify-between'>
                <p className="text-lg text-foreground">{data?.description ?? "No Description found"}</p>
            </div>
            {data?.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {data?.tags.map((tag) => (
                        <Badge variant={"secondary"}>
                            {tag}
                        </Badge>
                    ))}
                </div>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {data?.author && (
                    <span className="inline-flex items-center gap-1">
                        <User className="size-3.5" />
                        {data?.author}
                    </span>
                )}

                {data?.publishedAt ? (<span className='inline-flex items-center gap-1'>
                    <Calendar className='size-3.5' />
                    {new Date(data?.publishedAt).toLocaleDateString("en-US")}
                </span>) : (<span className='inline-flex items-center gap-1'>
                    <Calendar />
                    {"No Published Date found"}
                </span>)}

                <span className='inline-flex items-center gap-1'>
                    <Clock className='size-3.5' />
                    Created: {new Date(data?.createdAt).toLocaleDateString("en-US")}
                </span>
            </div>
            <a href={data?.url} target="_blank" className="inline-flex items-center gap-1 text-primary text-sm hover:underline">
                <span>View Original</span>
                <ExternalLink className='size-3.5' />
            </a>

            <Card className='border-primary/20 bg-primary/5'>
                <CardContent>
                    <div className="flex items-center justify-between gap-4">
                        <div className='flex-1'>
                            <h2 className='text-sm font-semibold uppercase tracking-wide text-primary mb-3'>Summary</h2>
                            {completion || data.summary ? (
                                <MessageResponse>
                                    {completion}
                                </MessageResponse>) : (
                                <p className="text-muted-foreground italic">
                                    {data.content ? "No summary available yet. Generate one with AI" : "No content available to summarize yet."}
                                </p>
                            )
                            }
                        </div>
                        {data.content && !data.summary && (
                            <Button size="sm" disabled={isLoading} onClick={handleGenerateSummary}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className='size-4 animate-spin' />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className='mr-2 size-4' />
                                        Generate
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {data?.content && (
                <Collapsible open={contentOpen} onOpenChange={setContentOpen} >
                    <CollapsibleTrigger asChild>
                        <Button variant={"outline"} className='w-full justify-between'>
                            <span className="font-medium">Full Content</span>
                            <ChevronDown className={cn(contentOpen ? "rotate-180" : "", "size-4 transition-transform duration-200")} />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <Card className='mt-2'>
                            <CardContent>
                                <MessageResponse>
                                    {data.content}
                                </MessageResponse>
                            </CardContent>
                        </Card>
                    </CollapsibleContent>
                </Collapsible>
            )}
        </div>
    )
}
