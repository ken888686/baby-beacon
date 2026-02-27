import { clsx, type ClassValue } from "clsx"
import { parse } from "date-fns"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Combines a Date object with a time string (HH:mm or HH:mm:ss)
 */
export function combineDateAndTime(date: Date, timeStr: string): Date {
  return parse(
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T${timeStr}`,
    timeStr.split(':').length === 3 ? "yyyy-M-d'T'HH:mm:ss" : "yyyy-M-d'T'HH:mm",
    new Date()
  );
}
