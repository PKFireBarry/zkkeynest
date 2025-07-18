'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  DashboardSidebarProps, 
  DashboardPreferences
} from '@/types/sidebar';
import SidebarNavigation from './SidebarNavigation';



// Local storage key for preferences
const SIDEBAR_PREFERENCES_KEY = 'dashboard-preferences';

// Hook for managing sidebar preferences with localStorage
export function useSidebarPreferences() {
  const [preferences, setPreferences] = useState<DashboardPreferences>({
    sidebar: {
      activeView: 'api-keys',
      collapsed: false,
      lastUpdated: Date.now()
    }
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DashboardPreferences;
        setPreferences(parsed);
      }
    } catch (error) {
      console.warn('Failed to load sidebar preferences:', error);
      // Continue with default preferences
    }
  }, []);

  // Save preferences to localStorage
  const updatePreferences = (updates: Partial<DashboardPreferences['sidebar']>) => {
    const newPreferences: DashboardPreferences = {
      sidebar: {
        ...preferences.sidebar,
        ...updates,
        lastUpdated: Date.now()
      }
    };

    setPreferences(newPreferences);

    try {
      localStorage.setItem(SIDEBAR_PREFERENCES_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      console.warn('Failed to save sidebar preferences:', error);
      // Continue without localStorage persistence
    }
  };

  return {
    preferences: preferences.sidebar,
    updatePreferences
  };
}

// Hook for responsive behavior
function useResponsiveBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

// Mobile overlay component
interface MobileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileOverlay({ isOpen, onClose }: MobileOverlayProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] lg:hidden"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

// Sidebar toggle button for mobile with enhanced accessibility
interface SidebarToggleProps {
  collapsed: boolean;
  onToggle: () => void;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

function SidebarToggle({ collapsed, onToggle, breakpoint }: SidebarToggleProps) {
  if (breakpoint === 'desktop') return null;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Handle Enter and Space key activation
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={cn(
        'fixed top-4 left-4 z-[70] shadow-lg border-border bg-background/95 backdrop-blur-sm',
        'lg:hidden', // Hide on desktop
        breakpoint === 'mobile' && 'h-10 w-10 p-0',
        // Enhanced focus styles for accessibility with brand colors
        'focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:ring-offset-2',
        'hover:bg-gradient-to-r hover:from-[#6366f1]/10 hover:to-[#a21caf]/10',
        'hover:border-[#6366f1]/30 hover:shadow-md',
        'transition-all duration-200'
      )}
      aria-label={collapsed ? 'Open navigation sidebar' : 'Close navigation sidebar'}
      aria-expanded={!collapsed}
      aria-controls="dashboard-sidebar"
    >
      {collapsed ? (
        <Menu className="h-4 w-4" aria-hidden="true" />
      ) : (
        <X className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
}

// Main sidebar component
export default function DashboardSidebar({
  activeView,
  onViewChange,
  collapsed,
  onToggleCollapse
}: DashboardSidebarProps) {
  const breakpoint = useResponsiveBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';

  // Auto-collapse on mobile and tablet by default (only on initial load)
  useEffect(() => {
    if (isMobile && !collapsed) {
      // Only auto-collapse if this is the initial load, not when toggling
      const isInitialLoad = !localStorage.getItem('sidebar-manual-toggle');
      if (isInitialLoad) {
        onToggleCollapse();
      }
    }
  }, [isMobile]); // Removed collapsed and onToggleCollapse from dependencies

  // Handle mobile view changes - close sidebar after selection
  const handleViewChange = (view: typeof activeView) => {
    onViewChange(view);
    if (isMobile && !collapsed) {
      onToggleCollapse();
    }
  };

  // Track manual toggle to prevent auto-collapse interference
  const handleToggleWithTracking = () => {
    localStorage.setItem('sidebar-manual-toggle', 'true');
    onToggleCollapse();
  };

  // Calculate responsive widths
  const getResponsiveWidth = () => {
    if (collapsed) return 'w-16';
    
    switch (breakpoint) {
      case 'mobile':
        return 'w-72'; // Optimal width for mobile overlay
      case 'tablet':
        return 'w-64'; // Standard width on tablet
      case 'desktop':
      default:
        return 'w-64'; // Standard width on desktop
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <MobileOverlay 
        isOpen={isMobile && !collapsed} 
        onClose={handleToggleWithTracking} 
      />

      {/* Mobile Toggle Button */}
      <SidebarToggle 
        collapsed={collapsed}
        onToggle={handleToggleWithTracking}
        breakpoint={breakpoint}
      />

      {/* Sidebar */}
      <Card 
        id="dashboard-sidebar"
        role="complementary"
        aria-label="Dashboard navigation sidebar"
        aria-hidden={collapsed && (isMobile || isTablet)}
        className={cn(
          'h-full flex flex-col transition-all duration-300 ease-in-out',
          'bg-card border-border shadow-sm',
          getResponsiveWidth(),
          
          // Desktop positioning
          'lg:relative lg:translate-x-0',
          
          // Mobile/Tablet positioning - slide in from left with higher z-index
          isMobile && [
            'fixed top-0 left-0 z-[60] h-screen',
            collapsed ? '-translate-x-full' : 'translate-x-0'
          ],
          
          // Tablet positioning
          isTablet && [
            'fixed top-0 left-0 z-[50] h-screen',
            collapsed ? '-translate-x-full' : 'translate-x-0'
          ],
          
          // Enhanced shadow for mobile/tablet overlay
          (isMobile || isTablet) && 'shadow-2xl border-r-0'
        )}
      >
        {/* Sidebar Header */}
        <header 
          className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50"
          role="banner"
        >
          {!collapsed && (
            <h1 
              className="text-lg font-bold tracking-tight bg-gradient-to-r from-[#6366f1] to-[#a21caf] bg-clip-text text-transparent"
              id="sidebar-title"
            >
              Dashboard
            </h1>
          )}
          
          {/* Desktop collapse button */}
          {breakpoint === 'desktop' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleWithTracking}
              className={cn(
                "h-8 w-8 p-0",
                // Enhanced focus styles for accessibility with brand colors
                "focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:ring-offset-2",
                "hover:bg-gradient-to-r hover:from-[#6366f1]/10 hover:to-[#a21caf]/10",
                "hover:shadow-sm transition-all duration-200"
              )}
              aria-label={collapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
              aria-expanded={!collapsed}
              aria-controls="sidebar-navigation"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          )}
          
          {/* Mobile/Tablet close button */}
          {(isMobile || isTablet) && !collapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleWithTracking}
              className={cn(
                "h-8 w-8 p-0",
                // Enhanced focus styles for accessibility with brand colors
                "focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:ring-offset-2",
                "hover:bg-gradient-to-r hover:from-[#6366f1]/10 hover:to-[#a21caf]/10",
                "hover:shadow-sm transition-all duration-200"
              )}
              aria-label="Close navigation sidebar"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </header>

        {/* Enhanced Navigation Content */}
        <SidebarNavigation
          activeView={activeView}
          onViewChange={handleViewChange}
          collapsed={collapsed}
        />
      </Card>
    </>
  );
}