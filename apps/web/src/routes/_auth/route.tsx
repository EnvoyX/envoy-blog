import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background font-mono">
      <div className="absolute top-8 left-8">
        <Link to="/" className={buttonVariants({ variant: 'default' })}>
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>
      <div className="flex min-h-screen justify-center items-center">
        <Outlet />
      </div>
    </div>
  );
}
