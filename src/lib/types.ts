import { LucideIcon } from "lucide-react"

export interface NavPrimaryProps {
    items: {
        title: string
        to: string
        icon: LucideIcon
        activeOptions: {
            exact: boolean
        }
    }[]
}
