'use client';

import { 
  Key, 
  Settings, 
  CreditCard, 
  Clock, 
  Lock, 
  Trash2
} from 'lucide-react';
import { useRef, useEffect, useState, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { 
  NavItem, 
  SidebarView,
  SidebarNavigationProps 
} from '@/types/sidebar';

// Navigation items configuration with organized sections
export const navigationItems: NavItem[] = [
  { id: 'api-keys', label: 'API Keys', icon: Key, section: 'main' },
  { id: 'session-timeout', label: 'Session Timeout', icon: Clock, section: 'security' },
  { id: 'billing', label: 'Billing', icon: CreditCard, section: 'account' },
  { id: 'data-management', label: 'Data Management', icon: Settings, section: 'data' }
];

// Additional action items (not navigation views)
export interface ActionItem {
  id: string;
  label: string;
  icon: typeof Lock;
  section: 'main' | 'security' | 'account' | 'data';
}

export const actionItems: ActionItem[] = [
  { id: 'lock-vault', label: 'Lock Vault', icon: Lock, section: 'security' },
  { id: 'clear-data', label: 'Clear Data', icon: Trash2, section: 'security' }
];

// Navigation item component with enhanced styling and accessibility
interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  tabIndex?: number;
}

function NavItemComponent({ item, isActive, collapsed, onClick, onKeyDown, tabIndex }: NavItemComponentProps) {
  const Icon = item.icon;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    // Handle Enter and Space key activation
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
    
    // Pass through other key events for arrow navigation
    onKeyDown?.(event);
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      role="menuitem"
      aria-label={`Navigate to ${item.label}${collapsed ? ' section' : ''}`}
      aria-describedby={collapsed ? `${item.id}-tooltip` : undefined}
      className={cn(
        // Base styles matching homepage card patterns
        'group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left',
        'transition-all duration-200 ease-out',
        // Focus states with proper ring
        'focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:ring-offset-2',
        
        // Default state - subtle and clean
        'text-foreground/70 hover:text-foreground',
        'hover:bg-muted/60 hover:shadow-sm',
        'hover:scale-[1.02]',
        
        // Active state with brand gradient (matching homepage primary buttons)
        isActive && [
          'bg-gradient-to-r from-[#6366f1] to-[#a21caf]',
          'text-white shadow-lg',
          'hover:shadow-xl',
          'scale-[1.02]'
        ],
        
        // Collapsed state adjustments
        collapsed && 'justify-center px-2 hover:scale-105'
      )}
      title={collapsed ? item.label : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon 
        className={cn(
          'h-5 w-5 flex-shrink-0 transition-all duration-200',
          isActive 
            ? 'text-white' 
            : 'text-foreground/50 group-hover:text-foreground group-hover:scale-110'
        )}
        aria-hidden="true"
      />
      
      {!collapsed && (
        <>
          <span className="text-sm font-semibold flex-1 truncate">
            {item.label}
          </span>
          {item.badge && (
            <span 
              className={cn(
                'text-xs px-2.5 py-1 rounded-full font-semibold transition-all duration-200',
                isActive 
                  ? 'bg-white/25 text-white' 
                  : 'bg-muted text-muted-foreground'
              )}
              aria-label={`${item.badge} notifications`}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
      
      {/* Tooltip for collapsed state - hidden but available for screen readers */}
      {collapsed && (
        <span id={`${item.id}-tooltip`} className="sr-only">
          {item.label}
        </span>
      )}
    </button>
  );
}

// Action item component (for non-navigation actions like Lock Vault, Clear Data)
interface ActionItemComponentProps {
  item: { id: string; label: string; icon: any; section: string };
  collapsed: boolean;
  onClick: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  tabIndex?: number;
}

function ActionItemComponent({ item, collapsed, onClick, onKeyDown, tabIndex }: ActionItemComponentProps) {
  const Icon = item.icon;
  const isDestructive = item.id === 'clear-data';

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    // Handle Enter and Space key activation
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
    
    // Pass through other key events for arrow navigation
    onKeyDown?.(event);
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      role="menuitem"
      aria-label={`${item.label}${isDestructive ? ' (destructive action)' : ''}${collapsed ? ' - ' + item.label : ''}`}
      aria-describedby={collapsed ? `${item.id}-tooltip` : undefined}
      className={cn(
        // Base styles matching homepage patterns
        'group w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left',
        'transition-all duration-200 ease-out',
        // Focus states
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        
        // Default state
        'text-foreground/70 hover:text-foreground',
        'hover:bg-muted/60 hover:shadow-sm',
        'hover:scale-[1.02]',
        
        // Destructive action styling (matching homepage error states)
        isDestructive && [
          'text-destructive/70 hover:text-destructive',
          'hover:bg-red-50 dark:hover:bg-red-950/20',
          'focus:ring-red-500'
        ],
        
        // Non-destructive actions
        !isDestructive && [
          'focus:ring-[#6366f1]/50'
        ],
        
        // Collapsed state adjustments
        collapsed && 'justify-center px-2 hover:scale-105'
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon 
        className={cn(
          'h-5 w-5 flex-shrink-0 transition-all duration-200',
          isDestructive 
            ? 'text-destructive/50 group-hover:text-destructive group-hover:scale-110' 
            : 'text-foreground/50 group-hover:text-foreground group-hover:scale-110'
        )}
        aria-hidden="true"
      />
      
      {!collapsed && (
        <span className="text-sm font-semibold flex-1 truncate">
          {item.label}
        </span>
      )}
      
      {/* Tooltip for collapsed state - hidden but available for screen readers */}
      {collapsed && (
        <span id={`${item.id}-tooltip`} className="sr-only">
          {item.label}
        </span>
      )}
    </button>
  );
}

// Section header component with enhanced styling and accessibility
interface SectionHeaderProps {
  title: string;
  collapsed: boolean;
}

function SectionHeader({ title, collapsed }: SectionHeaderProps) {
  if (collapsed) {
    return (
      <div className="relative px-3 py-3" aria-hidden="true">
        <div className="h-px bg-border/30" />
      </div>
    );
  }

  return (
    <div className="px-3 py-2 mb-1">
      <div className="flex items-center gap-2">
        <h3 
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground select-none"
          id={`section-${title.toLowerCase()}`}
        >
          {title}
        </h3>
        <div className="flex-1 h-px bg-border/30" aria-hidden="true" />
      </div>
    </div>
  );
}

// Navigation section component for better organization with keyboard navigation
interface NavigationSectionProps {
  title: string;
  items: NavItem[];
  actionItems?: { id: string; label: string; icon: any; section: string }[];
  activeView: SidebarView;
  collapsed: boolean;
  onViewChange: (view: SidebarView) => void;
  onActionClick?: (actionId: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
  focusedIndex?: number;
  sectionStartIndex?: number;
}

function NavigationSection({ 
  title, 
  items, 
  actionItems = [], 
  activeView, 
  collapsed, 
  onViewChange, 
  onActionClick,
  onKeyDown,
  focusedIndex,
  sectionStartIndex = 0
}: NavigationSectionProps) {
  if (items.length === 0 && actionItems.length === 0) {
    return null;
  }

  const allItems = [...items, ...actionItems];

  return (
    <div 
      className={cn(
        "space-y-2",
        collapsed ? "space-y-1" : "space-y-3"
      )}
      role="group"
      aria-labelledby={`section-${title.toLowerCase()}`}
    >
      <SectionHeader title={title} collapsed={collapsed} />
      <div 
        className={cn(
          "space-y-1",
          collapsed ? "space-y-0.5" : "space-y-1.5"
        )}
        role="menu"
        aria-label={`${title} navigation`}
      >
        {/* Navigation items first */}
        {items.map((item, index) => (
          <NavItemComponent
            key={item.id}
            item={item}
            isActive={activeView === item.id}
            collapsed={collapsed}
            onClick={() => onViewChange(item.id)}
            onKeyDown={onKeyDown}
            tabIndex={focusedIndex === sectionStartIndex + index ? 0 : -1}
          />
        ))}
        
        {/* Action items with subtle separator if both exist */}
        {items.length > 0 && actionItems.length > 0 && !collapsed && (
          <div className="h-px bg-border/20 mx-3 my-2" aria-hidden="true" />
        )}
        
        {actionItems.map((item, index) => (
          <ActionItemComponent
            key={item.id}
            item={item}
            collapsed={collapsed}
            onClick={() => onActionClick?.(item.id)}
            onKeyDown={onKeyDown}
            tabIndex={focusedIndex === sectionStartIndex + items.length + index ? 0 : -1}
          />
        ))}
      </div>
    </div>
  );
}

// Main sidebar navigation component with comprehensive keyboard navigation
export default function SidebarNavigation({
  activeView,
  onViewChange,
  collapsed
}: SidebarNavigationProps) {
  const navRef = useRef<HTMLElement>(null);
  
  // Group navigation items by section
  const mainItems = navigationItems.filter(item => item.section === 'main');
  const securityItems = navigationItems.filter(item => item.section === 'security');
  const accountItems = navigationItems.filter(item => item.section === 'account');
  const dataItems = navigationItems.filter(item => item.section === 'data');
  
  // Group action items by section
  const securityActionItems = actionItems.filter(item => item.section === 'security');

  // Create flat list of all navigable items for keyboard navigation
  const allNavigableItems = [
    ...mainItems,
    ...securityItems,
    ...securityActionItems,
    ...accountItems,
    ...dataItems
  ];

  // State for keyboard navigation focus management
  const [focusedIndex, setFocusedIndex] = useState<number>(() => {
    // Initialize focus to the active view item
    const activeIndex = allNavigableItems.findIndex(item => 
      'id' in item && item.id === activeView
    );
    return activeIndex >= 0 ? activeIndex : 0;
  });

  // Update focused index when active view changes
  useEffect(() => {
    const activeIndex = allNavigableItems.findIndex(item => 
      'id' in item && item.id === activeView
    );
    if (activeIndex >= 0) {
      setFocusedIndex(activeIndex);
    }
  }, [activeView, allNavigableItems]);

  // Focus management for keyboard navigation
  useEffect(() => {
    const focusCurrentItem = () => {
      if (navRef.current) {
        const buttons = navRef.current.querySelectorAll('button[role="menuitem"]');
        const targetButton = buttons[focusedIndex] as HTMLButtonElement;
        if (targetButton) {
          targetButton.focus();
        }
      }
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(focusCurrentItem, 10);
    return () => clearTimeout(timeoutId);
  }, [focusedIndex]);

  // Keyboard navigation handler
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev < allNavigableItems.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : allNavigableItems.length - 1
        );
        break;
        
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
        
      case 'End':
        event.preventDefault();
        setFocusedIndex(allNavigableItems.length - 1);
        break;
        
      case 'Escape':
        event.preventDefault();
        // Blur the current element to exit keyboard navigation
        (event.target as HTMLButtonElement).blur();
        break;
    }
  };

  const handleActionClick = (actionId: string) => {
    // Emit custom event for parent component to handle
    window.dispatchEvent(new CustomEvent('sidebar-action', { 
      detail: { action: actionId } 
    }));
  };

  // Calculate section start indices for proper tabIndex management
  const mainStartIndex = 0;
  const securityStartIndex = mainItems.length;
  const accountStartIndex = securityStartIndex + securityItems.length + securityActionItems.length;
  const dataStartIndex = accountStartIndex + accountItems.length;

  return (
    <nav 
      ref={navRef}
      id="sidebar-navigation"
      className={cn(
        "flex-1 overflow-y-auto",
        "scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent",
        collapsed ? "px-2 py-4 space-y-4" : "px-4 py-6 space-y-6"
      )}
      aria-label="Dashboard navigation"
      role="menubar"
      aria-orientation="vertical"
    >
      {/* Main Section - Primary navigation */}
      <NavigationSection
        title="Main"
        items={mainItems}
        activeView={activeView}
        collapsed={collapsed}
        onViewChange={onViewChange}
        onKeyDown={handleKeyDown}
        focusedIndex={focusedIndex}
        sectionStartIndex={mainStartIndex}
      />

      {/* Security Section - Security-related settings and actions */}
      <NavigationSection
        title="Security"
        items={securityItems}
        actionItems={securityActionItems}
        activeView={activeView}
        collapsed={collapsed}
        onViewChange={onViewChange}
        onActionClick={handleActionClick}
        onKeyDown={handleKeyDown}
        focusedIndex={focusedIndex}
        sectionStartIndex={securityStartIndex}
      />

      {/* Account Section - User account management */}
      <NavigationSection
        title="Account"
        items={accountItems}
        activeView={activeView}
        collapsed={collapsed}
        onViewChange={onViewChange}
        onKeyDown={handleKeyDown}
        focusedIndex={focusedIndex}
        sectionStartIndex={accountStartIndex}
      />

      {/* Data Section - Data management and backup */}
      <NavigationSection
        title="Data"
        items={dataItems}
        activeView={activeView}
        collapsed={collapsed}
        onViewChange={onViewChange}
        onKeyDown={handleKeyDown}
        focusedIndex={focusedIndex}
        sectionStartIndex={dataStartIndex}
      />
    </nav>
  );
}