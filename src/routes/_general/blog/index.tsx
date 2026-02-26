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
    const { data } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const res = await getTreaty().user.profile.get()
            return res
        }
    })
    const { data: session } = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const res = await getTreaty().user.session.get()
            return res
        }
    })
    return <div>
        <span>Hello World</span>
        <span>{response?.data}</span>
        <span>{data?.data?.user?.email}</span>
        <span>User Id : {session?.data?.session?.userId}</span>
    </div>
}
