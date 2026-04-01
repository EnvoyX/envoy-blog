import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router'
import { Pencil, Save } from 'lucide-react';

export const Route = createFileRoute('/dashboard/quran-tracker/')({
  component: RouteComponent,
})

function RouteComponent() {
   return (
        <div className="px-4 min-h-screen flex flex-col">
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold">{`Qur'an Tracker`}</h1>
                <p className="text-muted-foreground">Update and track your {`Qur'an tilawah progress`} .</p>
                <Tabs defaultValue='saved-progress' className='mt-6'>
                <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value="saved-progress" className='gap-2'>
                        <Save className='size-4' />
                        Saved Progress
                    </TabsTrigger>
                    <TabsTrigger value="update-progress" className='gap-2'>
                        <Pencil className='size-4' />
                        Update Progress
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="saved-progress">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your saved progress</CardTitle>
                            <CardDescription>Latest and current progress of your tilawah</CardDescription>
                        </CardHeader>
                        <CardContent>
                           Saved Progress
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="update-progress">
                    <Card>
                        <CardHeader>
                            <CardTitle>Update your progress here</CardTitle>
                            <CardDescription>{`Fill the form below to update`}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          Update Form
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            </div>
        </div>
    )
}
