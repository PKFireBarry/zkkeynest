'use client';

import Link from "next/link";
import { useState } from "react";
import { Menu, ChevronDown, Key, Settings, CreditCard, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import MobileMenu from "@/components/MobileMenu";
import { getHomepageNavigation } from "@/lib/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  showHomeLinks?: boolean;
  showDashboardLinks?: boolean;
  showAllHomeSections?: boolean;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export default function Navbar({ showHomeLinks = true, showDashboardLinks = false, showAllHomeSections = false, activeView, onViewChange }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If dashboard links are shown, never show home links
  const effectiveShowHomeLinks = showDashboardLinks ? false : showHomeLinks;

  // Get navigation links for homepage sections
  const homepageNavigation = getHomepageNavigation();

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };
  return (
    <header className={`fixed top-0 left-0 right-0 z-40 w-full flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4 sm:py-5 border-b border-border/50 transition-all duration-200 ${
      isMobileMenuOpen ? 'bg-background' : 'bg-background/95 backdrop-blur-sm'
    }`}>
      <Link href="/" className="flex items-center gap-2 select-none hover:scale-105 transition-transform duration-200">
        <img src="/logo.png" alt="zKkeynest logo" className="w-8 h-8 rounded-md object-contain" />
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-[#6366f1] to-[#a21caf] bg-clip-text text-transparent">zKkeynest</span>
      </Link>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        {effectiveShowHomeLinks && !showAllHomeSections && (
          <>
            <Link 
              href="#how-it-works" 
              className="relative px-3 py-2 rounded-md hover:text-[#6366f1] hover:bg-[#6366f1]/5 transition-all duration-200 group"
            >
              How it works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366f1] to-[#a21caf] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="#pricing" 
              className="relative px-3 py-2 rounded-md hover:text-[#6366f1] hover:bg-[#6366f1]/5 transition-all duration-200 group"
            >
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366f1] to-[#a21caf] group-hover:w-full transition-all duration-300"></span>
            </Link>
          </>
        )}
        {showAllHomeSections && (
          <>
            {homepageNavigation.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="relative px-3 py-2 rounded-md hover:text-[#6366f1] hover:bg-[#6366f1]/5 transition-all duration-200 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366f1] to-[#a21caf] group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </>
        )}
        {showDashboardLinks && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative px-3 py-2 rounded-md hover:text-[#6366f1] hover:bg-[#6366f1]/5 transition-all duration-200 group"
                >
                  Dashboard
                  <ChevronDown className="ml-1 h-4 w-4" />
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366f1] to-[#a21caf] group-hover:w-full transition-all duration-300"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={() => onViewChange?.('api-keys')}
                  className={activeView === 'api-keys' ? 'bg-[#6366f1]/10' : ''}
                >
                  <Key className="mr-2 h-4 w-4" />
                  API Keys
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onViewChange?.('data-management')}
                  className={activeView === 'data-management' ? 'bg-[#6366f1]/10' : ''}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Data Management
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onViewChange?.('billing')}
                  className={activeView === 'billing' ? 'bg-[#6366f1]/10' : ''}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onViewChange?.('session-timeout')}
                  className={activeView === 'session-timeout' ? 'bg-[#6366f1]/10' : ''}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Session Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onViewChange?.('lock-vault')}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Lock Vault
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        <SignedOut>
          <Link 
            href="/sign-in" 
            className="relative px-3 py-2 rounded-md hover:text-[#6366f1] hover:bg-[#6366f1]/5 transition-all duration-200 group"
          >
            Sign In
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366f1] to-[#a21caf] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Button asChild size="sm" className="ml-2 bg-gradient-to-r from-[#6366f1] to-[#a21caf] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 px-5 py-2 rounded-md">
            <Link href="/sign-up">Get Started Free</Link>
          </Button>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <ThemeToggle />
      </nav>
      <div className="md:hidden flex items-center gap-1 shrink-0 min-w-0">
        {/* Always show dashboard menu on mobile when showDashboardLinks is true */}
        {showDashboardLinks && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 rounded-md hover:bg-[#6366f1]/10 hover:text-[#6366f1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-offset-2 border border-border/20 bg-background"
                aria-label="Dashboard menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-[60] mt-2">
              <DropdownMenuItem 
                onClick={() => onViewChange?.('api-keys')}
                className={activeView === 'api-keys' ? 'bg-[#6366f1]/10' : ''}
              >
                <Key className="mr-2 h-4 w-4" />
                API Keys
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onViewChange?.('data-management')}
                className={activeView === 'data-management' ? 'bg-[#6366f1]/10' : ''}
              >
                <Settings className="mr-2 h-4 w-4" />
                Data Management
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onViewChange?.('billing')}
                className={activeView === 'billing' ? 'bg-[#6366f1]/10' : ''}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onViewChange?.('session-timeout')}
                className={activeView === 'session-timeout' ? 'bg-[#6366f1]/10' : ''}
              >
                <Clock className="mr-2 h-4 w-4" />
                Session Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onViewChange?.('lock-vault')}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <Lock className="mr-2 h-4 w-4" />
                Lock Vault
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Homepage mobile menu */}
        {(effectiveShowHomeLinks || showAllHomeSections) && (
          <button
            onClick={handleMobileMenuToggle}
            className="p-2 rounded-md hover:bg-[#6366f1]/10 hover:text-[#6366f1] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:ring-offset-2 transform hover:scale-105"
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        
        {/* Always show user button and theme toggle on mobile */}
        <UserButton />
        <ThemeToggle />
      </div>

      {/* Mobile Menu */}
      {(effectiveShowHomeLinks || showAllHomeSections) && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={handleMobileMenuClose}
          navigationLinks={showAllHomeSections ? homepageNavigation : [
            { href: "#how-it-works", label: "How it Works", id: "how-it-works" },
            { href: "#pricing", label: "Pricing", id: "pricing" }
          ]}
        />
      )}
    </header>
  );
} 