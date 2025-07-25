import { LucideIcon } from 'lucide-react';

// Sidebar view types
export type SidebarView = 'api-keys' | 'data-management' | 'billing' | 'session-timeout';

// Navigation item interface
export interface NavItem {
  id: SidebarView;
  label: string;
  icon: LucideIcon;
  section: 'main' | 'security' | 'account' | 'data';
  badge?: string; // For notifications or status
}

// Sidebar preferences for localStorage
export interface SidebarPreferences {
  activeView: SidebarView;
  collapsed: boolean;
  lastUpdated: number;
}

// Dashboard preferences schema for localStorage
export interface DashboardPreferences {
  sidebar: SidebarPreferences;
}

// Props for sidebar components
export interface DashboardSidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export interface SidebarNavigationProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  collapsed: boolean;
}