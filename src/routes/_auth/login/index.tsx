import { LoginForm } from '@/components/web/login-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login/')({
    head: () => ({
        meta: [
            { title: 'Login | Envoy Blog' },
            {
                name: 'Envoy Blog',
                content: 'Welcome to TanStack Start playground!',
            },
            { property: 'og:title', content: "Login | Envoy Blog" },
            { property: 'og:description', content: "Login to your account in Envoy Blog" },
            { property: 'og:image', content: "https://tanstack.com/assets/og-C0HGjoLl.png" },
            { property: 'og:type', content: 'website' },
        ],
    }),
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <LoginForm />
    )
}
