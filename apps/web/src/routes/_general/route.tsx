import { Footer } from "@/components/web/footer";
import { Navbar } from "@/components/web/navbar";
import { User } from "@/generated/prisma/client";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_general")({
  component: RouteComponent,
  loader: ({ context }) => {
    return {
      user: context.user,
    };
  },
});

function RouteComponent() {
  const { user } = Route.useLoaderData();
  return (
    <main>
      <Navbar user={user as User} />
      <Outlet />
      <Footer />
    </main>
  );
}
