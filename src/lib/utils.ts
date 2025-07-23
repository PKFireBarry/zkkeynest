import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ADMIN_EMAILS = [
  'barry0719@gmail.com', // Replace with your actual admin email(s)
  // Add your actual email here if different
];

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

// Simple user ID based admin check for your personal use
export function isAdminUserId(userId?: string | null): boolean {
  return userId === 'user_2zvYkVykg0hZDCqGFOMHNnWkyWM';
}
