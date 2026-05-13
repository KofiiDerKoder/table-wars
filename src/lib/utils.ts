/**
 * TABLE WARS! - Utility Helpers
 * 
 * Last Updated: May 13, 2026
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names and merges Tailwind utility conflicts.
 * Essential for dynamic class construction in complex UI components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
