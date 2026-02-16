import { Button } from '@/components/ui/button'
import { getProfileData } from '@/data/session'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Camera, Loader2, Mail, ShieldCheck, UserIcon } from 'lucide-react'

export const Route = createFileRoute('/dashboard/profile')({
    head: () => ({
        meta: [
            { title: 'Profile | Envoy Blog' },
            {
                name: 'Envoy Blog',
                content: 'Welcome to TanStack Start playground!',
            },
            { property: 'og:title', content: "Profile | Envoy Blog" },
            { property: 'og:description', content: "View your profile information and settings" },
            { property: 'og:image', content: "https://tanstack.com/assets/og-C0HGjoLl.png" },
            { property: 'og:type', content: 'website' },
        ],
    }),
    component: RouteComponent,
})

function RouteComponent() {
    const { data: user, isPending, isError } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const user = await getProfileData()
            return user
        }
    })

    if (isPending) {
        return (
            <section className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className='size-10 animate-spin text-yellow-500' />
            </section>
        )
    }

    if (isError || !user) {
        return (
            <section className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
                <h1 className='text-destructive font-semibold text-xl'>Failed to load profile data</h1>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
                >
                    Try Again
                </button>
            </section>
        )
    }

    return (
        <main className="max-w-4xl mx-auto py-12 px-6">
            <header className="mb-10 flex flex-col md:flex-row items-center gap-6">
                <div className="relative group">
                    <div className="size-32 rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-600 p-1">
                        <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center overflow-hidden">
                            {user.image ? (
                                <img src={user.image} alt={user.name ?? 'User'} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="size-12 text-muted-foreground" />
                            )}
                        </div>
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-surface border border-border rounded-full shadow-lg hover:text-yellow-500 transition-colors">
                        <Camera className="size-4" />
                    </button>
                </div>

                <div className="text-center md:text-left space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">{user.name || 'Anonymous User'}</h1>
                    <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                        <Mail className="size-4" /> {user.email}
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-yellow-600 mb-4">Account Details</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2 text-sm">
                                <ShieldCheck className="size-4" /> Status
                            </span>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${user.emailVerified ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                {user.emailVerified ? 'Verified' : 'Pending Verification'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2 text-sm">
                                <Calendar className="size-4" /> Joined
                            </span>
                            <span className="text-sm font-medium">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-yellow-600 mb-4">System Info</h2>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">User ID</span>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{user.id?.slice(0, 8)}...</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Linked Accounts</span>
                            <span className="font-medium truncate">
                                {user.accounts.map((account) => account.providerId.toUpperCase()).join(" | ")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-12 pt-6 border-t border-border flex gap-4">
                <Button variant="default" className="px-5 py-2.5 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity">
                    Edit Profile
                </Button>
                <Button variant={"outline"} className="px-5 py-2.5 bg-background border border-border font-medium rounded-lg hover:bg-muted transition-colors text-destructive">
                    Logout
                </Button>
            </footer>
        </main>
    )
}
