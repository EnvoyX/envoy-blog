import { z } from "zod"
export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid Email" }),
    password: z.string().min(8, "Password must be at least 8 characters long")
})
export const signUpSchema = z.object({
    fullName: z.string().min(5, "Full name must be at least 5 characters long"),
    email: z.string().email({ message: "Invalid Email" }),
    password: z.string().min(8, "Password must be at least 8 characters long")
})
