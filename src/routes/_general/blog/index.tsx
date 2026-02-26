import { getTreaty } from '@/routes/api/$'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_general/blog/')({
    component: RouteComponent,
    // Loader way to fetch data from elysia
    // loader: () => getTreaty().get().then((res) => res.data)
})

function RouteComponent() {
    const { data: response } = useQuery({
        queryKey: ['hello-elysia'],
        queryFn: () => getTreaty().get()
    })
    return <div>Hello Blog Page
        <span>{response?.data}</span>
    </div>
}
