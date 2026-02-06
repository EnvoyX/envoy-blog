import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signUpSchema } from "@/schemas/auth"
import { Link, useNavigate } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import AuthButtons from "./auth-buttons"
import { useEffect, useRef } from "react"

export function SignupForm() {
    const navigate = useNavigate()
    const form = useForm({
        defaultValues: {
            fullName: "",
            email: "",
            password: "",

        },
        validators: {
            onSubmit: signUpSchema,
        },
        onSubmit: async ({ value }) => {
            console.log(value)
            await authClient.signUp.email({
                name: value.fullName,
                email: value.email,
                password: value.password,
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Successfully signed up!")
                        navigate({
                            to: "/",

                        })
                    },
                    onError: ({ error }) => {
                        toast.error("Error signing up", {
                            description: error.message,
                        })
                    }
                }
            })
        },
    })
    const hasInitialized = useRef(false)
    useEffect(() => {
        if (hasInitialized.current) return

        hasInitialized.current = true
    })
    return (
        <Card className="max-w-md w-full">
            <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                    Enter your information below to create your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}>
                    <FieldGroup>
                        <form.Field
                            name="fullName"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder="John Doe"
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
                        />
                        <FieldGroup>
                            <Field>
                                <Button type="submit">Create Account</Button>
                                <AuthButtons />
                                <FieldDescription className="px-6 text-center">
                                    Already have an account? <Link to="/login">Sign in</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
