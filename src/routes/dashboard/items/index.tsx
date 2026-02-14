import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { getItems } from '@/data/items'
import { Link } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { Copy } from 'lucide-react'

export const Route = createFileRoute('/dashboard/items/')({
    head: () => ({
        meta: [
            { title: 'Items | Envoy Blog' },
            {
                name: 'Envoy Blog',
                content: 'Welcome to TanStack Start playground!',
            },
        ],
    }),
    component: RouteComponent,
    loader: () => getItems()
})

function RouteComponent() {
    const datas = Route.useLoaderData()
    return <div className='grid gap-6 md:grid-cols-3'>
        {datas.map((data) => (
            <Card key={data.id} className="group overflow-hidden transition-all hover:shadow-lg hover:scale-105 pt-0">
                <Link to="/dashboard" className="block">
                    {data.ogImage && (
                        <div className='aspect-video w-full overflow-hidden bg-muted'>
                            <img src={data.ogImage} alt={data.title ?? "Blog Thumbnail"} className='h-full w-full object-cover group-hover:scale-105' />
                        </div>
                    )}
                    <CardHeader className='space-y-3 pt-4'>
                        <div className="flex items-center justify-between gap-2">
                            <Badge variant={data.status === "COMPLETED" ? "default" : "secondary"}>{data.status}</Badge>
                            <Button variant={"outline"} size="icon" className='size-8'>
                                <Copy className='size-4' />
                            </Button>
                        </div>
                        <CardTitle className='line-clamp-1 text-xl leading-snug group-hover:text-primary transition-colors'>
                            {data.title ?? "No Title"}
                        </CardTitle>
                        {data.author && <p className='text-xs text-muted-foreground'>
                            {data.author}
                        </p>}
                    </CardHeader>
                </Link>
            </Card>
        ))}
    </div>
}
