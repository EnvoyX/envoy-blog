// import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  //   FieldDescription,
  //   FieldError,
  FieldGroup,
  //   FieldLabel,
} from '@/components/ui/field'
// import { Input } from '@/components/ui/input'
// import { authClient } from '@/lib/auth-client'
// import { loginSchema } from '@/schemas/auth'
// import { useForm } from '@tanstack/react-form'
// import { useNavigate } from '@tanstack/react-router'
// import { toast } from 'sonner'
import AuthButtons from './auth-buttons'
import { useEffect, useRef, useTransition } from 'react'

export function LoginForm() {
  //   const navigate = useNavigate()
  //   const [isPending, startTransition] = useTransition()
  //   const form = useForm({
  //     defaultValues: {
  //       email: '',
  //       password: '',
  //     },
  //     validators: {
  //       onSubmit: loginSchema,
  //     },
  //     onSubmit: ({ value }) => {
  //       console.log(value)
  //       startTransition(async () => {
  //         await authClient.signIn.email({
  //           email: value.email,
  //           password: value.password,
  //           fetchOptions: {
  //             onSuccess: () => {
  //               toast.success('Logged in successfully!')
  //               navigate({
  //                 to: '/dashboard',
  //               })
  //             },
  //             onError: ({ error }) => {
  //               toast.error(error.message)
  //             },
  //           },
  //         })
  //       })
  //     },
  //   })
  const hasInitialized = useRef(false)
  useEffect(() => {
    if (hasInitialized.current) return

    hasInitialized.current = true
  })

  return (
    <Card className="max-w-md w-full bg-emerald-950">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Sign in to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form
        //   onSubmit={(e) => {
        //     e.preventDefault()
        //     form.handleSubmit()
        //   }}
        >
          <FieldGroup>
            {/* <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="johndoe@gmail.com"
                      type="email"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Super secret password"
                      type="password"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            /> */}
            <Field>
              {/* <Button disabled={isPending} type="submit">
                {isPending ? 'Logging in...' : 'Login'}
              </Button> */}
              <AuthButtons />
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
