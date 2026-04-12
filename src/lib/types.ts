import { LucideIcon } from 'lucide-react'

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

export interface NavProps {
  items: {
    title: string
    to: string
    activeOptions: {
      exact: boolean
    }
  }[]
}
