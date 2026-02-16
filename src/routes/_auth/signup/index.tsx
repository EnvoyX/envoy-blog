import { SignupForm } from '@/components/web/signup-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/signup/')({
    head: () => ({
        meta: [
            { title: 'Sign-Up | Envoy Blog' },
            {
                name: 'Envoy Blog',
                content: 'Welcome to TanStack Start playground!',
            },
            { property: 'og:title', content: "Sign-Up | Envoy Blog" },
            { property: 'og:description', content: "Sign in to your account in Envoy Blog" },
            { property: 'og:image', content: "https://tanstack.com/assets/og-C0HGjoLl.png" },
            { property: 'og:type', content: 'website' },
        ],
    }),
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <SignupForm />
    )
}
