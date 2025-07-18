'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { MobileMenuProps } from '@/types';

export default function MobileMenu({ isOpen, onClose, navigationLinks }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Dynamic dark mode detection with proper state updates
  useEffect(() => {
    const updateTheme = () => {
      const darkMode = document.documentElement.classList.contains('dark') || 
        (!document.documentElement.classList.contains('light') && 
         window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(darkMode);
    };

    // Initial check
    updateTheme();

    // Listen for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', updateTheme);
    };
  }, []);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        backdropRef.current &&
        backdropRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Use double requestAnimationFrame for smoother animation start
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before removing from DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 320); // Slightly longer to ensure animation completes
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Focus management - focus first link when menu opens
  useEffect(() => {
    if (isOpen && isAnimating && menuRef.current) {
      const firstLink = menuRef.current.querySelector('a');
      if (firstLink) {
        firstLink.focus();
      }
    }
  }, [isOpen, isAnimating]);

  const handleLinkClick = (href: string) => {
    onClose();
    // Small delay to allow menu to close before scrolling
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  if (!shouldRender) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      {/* Backdrop overlay with blur effect and animation */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300 ease-in-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`} 
      />
      
      {/* Mobile menu panel */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] border-l border-border/50 shadow-2xl transform transition-all duration-300 ease-out ${
          isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        style={{
          backgroundColor: isDarkMode ? 'oklch(0.208 0.042 265.755)' : '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          transition: 'transform 300ms ease-out, opacity 300ms ease-out, background-color 200ms ease-in-out'
        }}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 border-b border-border/30 bg-gradient-to-r from-[#6366f1]/5 to-[#a21caf]/5">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-[#6366f1] to-[#a21caf] bg-clip-text text-transparent">
            Navigation
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-[#6366f1]/10 hover:text-[#6366f1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-offset-2 transform hover:scale-105"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-6" role="navigation" aria-label="Mobile navigation">
          <ul className="space-y-3">
            {navigationLinks.map((link, index) => (
              <li 
                key={link.id}
                className={`transform transition-all duration-300 ease-out ${
                  isAnimating 
                    ? 'translate-x-0 opacity-100' 
                    : 'translate-x-4 opacity-0'
                }`}
                style={{
                  transitionDelay: isAnimating ? `${index * 50}ms` : '0ms'
                }}
              >
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.href);
                  }}
                  className="group relative block px-4 py-4 text-base font-medium rounded-lg hover:bg-gradient-to-r hover:from-[#6366f1]/10 hover:to-[#a21caf]/10 hover:text-[#6366f1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-offset-2 border border-transparent hover:border-[#6366f1]/20"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLinkClick(link.href);
                    }
                  }}
                >
                  <span className="relative z-10">{link.label}</span>
                  {/* Animated underline */}
                  <span className="absolute bottom-2 left-4 w-0 h-0.5 bg-gradient-to-r from-[#6366f1] to-[#a21caf] group-hover:w-[calc(100%-2rem)] transition-all duration-300"></span>
                  {/* Subtle glow effect */}
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#6366f1]/5 to-[#a21caf]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom gradient decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#6366f1]/5 via-[#a21caf]/5 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}