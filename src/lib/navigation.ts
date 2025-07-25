import { NavigationLink } from '@/types';

/**
 * Navigation configuration for homepage sections
 * Based on the homepage layout and sections available for navigation
 */
export const homepageNavigation: NavigationLink[] = [
  {
    href: '#hero',
    label: 'Home',
    id: 'hero'
  },
  {
    href: '#perfect-for',
    label: 'Perfect For',
    id: 'perfect-for'
  },
  {
    href: '#how-it-works',
    label: 'How it Works',
    id: 'how-it-works'
  },
  {
    href: '#value-proposition',
    label: 'Value',
    id: 'value-proposition'
  },
  {
    href: '#trust',
    label: 'Trust',
    id: 'trust'
  },
  {
    href: '#pricing',
    label: 'Pricing',
    id: 'pricing'
  },
  {
    href: '#compliance',
    label: 'Compliance',
    id: 'compliance'
  }
];

/**
 * Get navigation links for homepage sections
 * @returns Array of navigation links for homepage
 */
export const getHomepageNavigation = (): NavigationLink[] => {
  return homepageNavigation;
};

/**
 * Check if the browser supports CSS smooth scrolling
 * @returns boolean indicating if smooth scrolling is supported
 */
export const supportsSmoothScrolling = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if CSS scroll-behavior is supported
  return 'scrollBehavior' in document.documentElement.style;
};

/**
 * JavaScript fallback for smooth scrolling animation
 * @param element - The target element to scroll to
 * @param duration - Animation duration in milliseconds (default: 800)
 */
export const smoothScrollToElement = (element: HTMLElement, duration: number = 800): void => {
  const targetPosition = element.offsetTop;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  };

  requestAnimationFrame(animation);
};

/**
 * Easing function for smooth animation
 * @param t - Current time
 * @param b - Start value
 * @param c - Change in value
 * @param d - Duration
 * @returns Calculated position
 */
const easeInOutQuad = (t: number, b: number, c: number, d: number): number => {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

/**
 * Smooth scroll to a section by ID with fallback support
 * Handles edge cases where target sections don't exist
 * @param sectionId - The ID of the section to scroll to (without #)
 * @param duration - Animation duration for JavaScript fallback (default: 800ms)
 * @returns Promise that resolves when scrolling is complete or rejects if section not found
 */
export const scrollToSection = async (sectionId: string, duration: number = 800): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Handle edge case: empty or invalid section ID
    if (!sectionId || typeof sectionId !== 'string') {
      reject(new Error('Invalid section ID provided'));
      return;
    }

    // Clean the section ID (remove # if present)
    const cleanId = sectionId.startsWith('#') ? sectionId.slice(1) : sectionId;
    
    // Handle edge case: section doesn't exist
    const targetElement = document.getElementById(cleanId);
    if (!targetElement) {
      console.warn(`Section with ID "${cleanId}" not found`);
      reject(new Error(`Section with ID "${cleanId}" not found`));
      return;
    }

    // If browser supports CSS smooth scrolling, use it
    if (supportsSmoothScrolling()) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Since scrollIntoView doesn't return a promise, we estimate completion time
      setTimeout(() => resolve(), Math.min(duration, 1000));
    } else {
      // Use JavaScript fallback for browsers that don't support smooth scrolling
      try {
        smoothScrollToElement(targetElement, duration);
        setTimeout(() => resolve(), duration);
      } catch (error) {
        reject(error);
      }
    }
  });
};

