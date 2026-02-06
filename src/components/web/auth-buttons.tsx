import { authClient } from "@/lib/auth-client"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"

export default function AuthButtons() {
    const navigate = useNavigate()
    return (<>

        <Button
            onClick={async () => {

                await authClient.signIn.social({
                    provider: "google",
                    fetchOptions: {
                        onRequest() {
                            toast.loading("Logging in with Google...", {
                                id: "login-oauth"
                            })
                        },
                        onSuccess: () => {
                            toast.dismiss("login-oauth")
                            toast.success("Logged in with Google successfully")
                            navigate({
                                to: "/"
                            })
                        },
                        onError: ({ error }) => {
                            toast.dismiss("login-oauth")
                            toast.error("Failed to login with Google", {
                                description: error.message
                            })
                        }
                    }
                })
            }}
            variant="outline" type="button" className="cursor-pointer">
            Continue with Google
        </Button>
        <Button
            onClick={async () => {
                toast.loading("Logging in with Github...", {
                    id: "login-oauth"
                })
                await authClient.signIn.social({
                    provider: "github",
                    fetchOptions: {
                        onRequest() {
                            toast.loading("Logging in with Github...", {
                                id: "login-oauth"
                            })
                        },

                        onSuccess: () => {
                            toast.dismiss("login-oauth")
                            toast.success("Logged in with Github successfully")
                            navigate({
                                to: "/"
                            })
                        },
                        onError: ({ error }) => {
                            toast.dismiss("login-oauth")
                            toast.error("Failed to login with Github", {
                                description: error.message
                            })
                        }
                    }
                })
            }}
            variant="outline" type="button" className="cursor-pointer">
            Continue with Github
        </Button>
    </>)
}
