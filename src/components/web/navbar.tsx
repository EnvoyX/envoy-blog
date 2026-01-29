import { Link } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { ThemeToggle } from './theme-toggle'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-transparent backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://tanstack.com/images/logos/logo-color-banner-600.png"
            alt="TanStack Start logo"
            className="size-12"
          />
          <h1 className="text-lg font-bold text-white">TanStack Start Blog</h1>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant={'secondary'}>Login</Button>
          <Button variant={'outline'}>Get Started</Button>
        </div>
      </div>
    </nav>
  )
}
