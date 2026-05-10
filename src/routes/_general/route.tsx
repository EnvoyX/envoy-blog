import { Footer } from "@/components/web/footer";
import { Navbar } from "@/components/web/navbar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_general")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main>
      <Navbar />
      <Outlet />
      <Footer />
    </main>
  );
}
