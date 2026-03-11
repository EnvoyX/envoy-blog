import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_general/blog/')({
    component: RouteComponent,
    // Loader way to fetch data from elysia
})

function RouteComponent() {
    return <div>
        <span>Blog Page</span>
    </div>
}
