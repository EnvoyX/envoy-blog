import { authClient } from '@/lib/auth-client'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { useTransition } from 'react'

export default function AuthButtons() {
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  return (
    <>
      <Button
        onClick={() => {
          startTransition(async () => {
            await authClient.signIn.social({
              provider: 'google',
              callbackURL: '/dashboard',
              fetchOptions: {
                onRequest() {
                  toast.loading('Logging in with Google...', {
                    id: 'login-oauth',
                  })
                },
                onSuccess: () => {
                  toast.dismiss('login-oauth')
                  toast.success('Logged in with Google successfully')
                  navigate({
                    to: '/dashboard',
                  })
                },
                onError: ({ error }) => {
                  toast.dismiss('login-oauth')
                  toast.error('Failed to login with Google', {
                    description: error.message,
                  })
                },
              },
            })
          })
        }}
        variant="outline"
        type="button"
        className="cursor-pointer"
        disabled={isPending}
      >
        <p className="flex items-center  gap-1">
          <span className="icon-[material-icon-theme--google] size-5" />
          <span>{isPending ? 'Logging in...' : 'Continue with Google'}</span>
        </p>
      </Button>
      <Button
        onClick={() => {
          startTransition(async () => {
            await authClient.signIn.social({
              provider: 'github',
              callbackURL: '/dashboard',
              fetchOptions: {
                onRequest() {
                  toast.loading('Logging in with Github...', {
                    id: 'login-oauth',
                  })
                },

                onSuccess: () => {
                  toast.dismiss('login-oauth')
                  toast.success('Logged in with Github successfully')
                  navigate({
                    to: '/dashboard',
                  })
                },
                onError: ({ error }) => {
                  toast.dismiss('login-oauth')
                  toast.error('Failed to login with Github', {
                    description: error.message,
                  })
                },
              },
            })
          })
        }}
        variant="outline"
        type="button"
        className="cursor-pointer"
        disabled={isPending}
      >
        <p className="flex items-center gap-1">
          <span className="icon-[mdi--github] size-6" />
          <span>{isPending ? 'Logging in...' : 'Continue with Github'}</span>
        </p>
      </Button>
    </>
  )
}
