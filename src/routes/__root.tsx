import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import appCss from '../styles.css?url'
import { ThemeProvider } from '@/lib/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/components/web/query-provider'
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/react-pacer-devtools'

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                title: 'TanStack Start Starter',
            },
        ],
        links: [
            {
                rel: 'stylesheet',
                href: appCss,
            },
        ],
    }),

    shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <HeadContent />
            </head>
            <body>
                <QueryProvider>
                    <ThemeProvider>
                        {children}
                        <Toaster closeButton position='top-center' />
                    </ThemeProvider>
                    <TanStackDevtools
                        config={{
                            position: 'bottom-right',
                            defaultOpen: true,
                            hideUntilHover: true,
                            panelLocation: "bottom"
                        }}
                        plugins={[
                            {
                                name: 'TanStack Query',
                                render: <ReactQueryDevtoolsPanel />,
                                defaultOpen: true
                            },
                            {
                                name: 'Tanstack Router',
                                render: <TanStackRouterDevtoolsPanel />,
                                defaultOpen: true,
                            },
                            formDevtoolsPlugin(),
                            pacerDevtoolsPlugin(),
                        ]}
                    />
                    <Scripts />
                </QueryProvider>
            </body>
        </html>
    )
}
