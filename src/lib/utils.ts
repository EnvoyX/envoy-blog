import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { fromZonedTime } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const WIB_TZ = 'Asia/Jakarta'

export function wibToUTC(date: Date) {
  return fromZonedTime(date, WIB_TZ)
}

export const getCurrentDate = () => {
  const now = new Date()
  //     const now = new Date("2026-01-26T00:00:00");

  return now
}
