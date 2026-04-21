import { createFileRoute, redirect } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UsersDataTable } from '@/components/web/admin/UsersDataTable'
import AccountsDataTable from '@/components/web/admin/AccountsDataTable'
import SessionsDataTable from '@/components/web/admin/SessionsDataTable'
import { getUser } from '@/data/session'
export const Route = createFileRoute('/dashboard/admin/')({
  component: RouteComponent,
  loader: async () => {
    const session = await getUser()
    if (session.user.role !== 'ADMIN') {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
})

function RouteComponent() {
  return (
    <section className="min-h-screen bg-transparent w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
      </div>
      <Tabs defaultValue="account" className="mt-8 overflow-x-auto">
        <TabsList className="bg-white/5 border overflow-auto flex h-fit sm:flex-row">
          <TabsTrigger value="account" className="cursor-pointer">
            Account
          </TabsTrigger>
          <TabsTrigger value="session" className="cursor-pointer">
            Session
          </TabsTrigger>
          <TabsTrigger value="users" className="cursor-pointer">
            Users
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <div className="mt-8">
            <AccountsDataTable />
          </div>
        </TabsContent>
        <TabsContent value="session">
          <div className="mt-8">
            <SessionsDataTable />
          </div>
        </TabsContent>
        <TabsContent value="users">
          <div className="mt-8">
            <UsersDataTable />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
