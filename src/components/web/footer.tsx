import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Command, ShieldCheck, Zap } from "lucide-react";

import { navItemsMain } from "./NavItems";

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="relative border-t border-white/10 bg-background/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-20">
          <div className="md:col-span-2 space-y-6 ">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:border-primary/50 transition-colors">
                <Command className="size-6 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
                Envoy Mindpalace
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              A digital sanctuary for your thoughts, tasks, organize your mind, track your progress,
              and have fun!.
            </p>
            <div className="flex items-center gap-4">
              <a
                target="_blank"
                href="https://github.com/EnvoyX"
                className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                  <path
                    fill="currentColor"
                    d="M20 10.25q0 3.351-1.908 6.027t-4.928 3.703q-.352.068-.514-.093a.54.54 0 0 1-.163-.4V16.67q0-1.295-.677-1.895a9 9 0 0 0 1.335-.24q.591-.16 1.223-.52a3.7 3.7 0 0 0 1.055-.888q.423-.528.69-1.402t.267-2.008q0-1.616-1.028-2.75q.48-1.214-.105-2.723q-.364-.12-1.054.147a7 7 0 0 0-1.198.587l-.495.32a9 9 0 0 0-2.5-.346a9 9 0 0 0-2.5.347a12 12 0 0 0-.553-.36q-.345-.214-1.088-.514q-.741-.3-1.12-.18q-.572 1.507-.09 2.722q-1.03 1.134-1.03 2.75q0 1.134.268 2.002q.267.867.683 1.401a3.5 3.5 0 0 0 1.048.894q.632.36 1.224.52q.593.162 1.335.241q-.52.48-.638 1.375a2.5 2.5 0 0 1-.586.2a3.6 3.6 0 0 1-.742.067q-.43 0-.853-.287q-.423-.288-.723-.834a2.1 2.1 0 0 0-.631-.694q-.384-.267-.645-.32l-.26-.04q-.273 0-.378.06t-.065.153a.7.7 0 0 0 .117.187a1 1 0 0 0 .17.16l.09.066q.287.135.567.508q.28.374.41.68l.13.307q.17.507.574.821q.404.315.872.4q.468.087.905.094q.436.006.723-.047l.299-.053q0 .507.007 1.188l.006.72q0 .24-.17.4q-.168.162-.52.094q-3.021-1.028-4.928-3.703Q0 13.6 0 10.25q0-2.79 1.341-5.145a10.1 10.1 0 0 1 3.64-3.73A9.6 9.6 0 0 1 10 0a9.6 9.6 0 0 1 5.02 1.375a10.1 10.1 0 0 1 3.639 3.73Q20 7.461 20 10.25"
                  />
                </svg>
              </a>
              <a
                target="_blank"
                href="https://x.com/VersZehn"
                className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 14 14">
                  <g fill="none">
                    <g clipPath="url(#SVGG1Ot4cAD)">
                      <path
                        fill="currentColor"
                        d="M11.025.656h2.147L8.482 6.03L14 13.344H9.68L6.294 8.909l-3.87 4.435H.275l5.016-5.75L0 .657h4.43L7.486 4.71zm-.755 11.4h1.19L3.78 1.877H2.504z"
                      />
                    </g>
                    <defs>
                      <clipPath id="SVGG1Ot4cAD">
                        <path fill="#fff" d="M0 0h14v14H0z" />
                      </clipPath>
                    </defs>
                  </g>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/muhamad-hanif-hafizhan-824313296/"
                className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all"
                target="_blank"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M20.47 2H3.53a1.45 1.45 0 0 0-1.47 1.43v17.14A1.45 1.45 0 0 0 3.53 22h16.94a1.45 1.45 0 0 0 1.47-1.43V3.43A1.45 1.45 0 0 0 20.47 2M8.09 18.74h-3v-9h3ZM6.59 8.48a1.56 1.56 0 1 1 0-3.12a1.57 1.57 0 1 1 0 3.12m12.32 10.26h-3v-4.83c0-1.21-.43-2-1.52-2A1.65 1.65 0 0 0 12.85 13a2 2 0 0 0-.1.73v5h-3v-9h3V11a3 3 0 0 1 2.71-1.5c2 0 3.45 1.29 3.45 4.06Z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary/80">
              Navigation
            </h4>
            <ul className="space-y-3 text-sm grid grid-cols-2">
              {navItemsMain.map((item, idx) => {
                return (
                  <li key={idx}>
                    <Link
                      to={item.to}
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {item.title} <ArrowUpRight className="size-3 opacity-50" />
                    </Link>
                  </li>
                );
              })}
              {/*{session?.user &&
                sidebarNavItems.map((item, idx) => {
                  return (
                    <li key={idx}>
                      <Link
                        to={item.to}
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {item.title}{' '}
                        <ArrowUpRight className="size-3 opacity-50" />
                      </Link>
                    </li>
                  )
                })}*/}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary/80">
              Platform
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="size-4 text-yellow-500/80" />
                <span>Powered by TanStack</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-500/80" />
                <span>Secure Auth Ready</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground/60">
            © {currentYear} Envoy Mindpalace. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground/60">
            <a
              href="https://youtu.be/dQw4w9WgXcQ?si=4z3ruBEh0OM1gr9f"
              className="hover:text-primary transition-colors"
              target="_blank"
            >
              Made with 💩 by Mas Envoy.
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 -z-10 h-24 w-full max-w-3xl -translate-x-1/2 bg-primary/5 blur-[120px]" />
    </footer>
  );
}
