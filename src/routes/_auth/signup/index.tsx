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
        ],
    }),
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <SignupForm />
    )
}
