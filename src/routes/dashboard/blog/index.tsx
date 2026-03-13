import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router'
import { Pencil, Save } from 'lucide-react';

export const Route = createFileRoute('/dashboard/blog/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className="px-4 min-h-screen flex flex-col">
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold">Blogs</h1>
                <p className="text-muted-foreground">Create and view your blogs.</p>
                <Tabs defaultValue='saved-blog' className='mt-6'>
                <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value="saved-blog" className='gap-2'>
                        <Save className='size-4' />
                        Saved Blog
                    </TabsTrigger>
                    <TabsTrigger value="create-blog" className='gap-2'>
                        <Pencil className='size-4' />
                        Create Blog
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="saved-blog">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your saved Blogs</CardTitle>
                            <CardDescription>View all your created blogs</CardDescription>
                        </CardHeader>
                        <CardContent>
                           Saved blogs
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="create-blog">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Blog</CardTitle>
                            <CardDescription>{`Fill the form below to create blog`}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          Diary Form
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            </div>
        </div>
    )
}
