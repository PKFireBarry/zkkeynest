'use client';

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import DashboardContent from "@/components/DashboardContent";

export default function DashboardPage() {
  const { userId, isLoaded } = useAuth();
  const [activeView, setActiveView] = useState('api-keys');

  if (isLoaded && !userId) {
    redirect("/sign-in");
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-background text-foreground font-sans flex flex-col">
      <Navbar
        showDashboardLinks
        activeView={activeView}
        onViewChange={handleViewChange}
      />
      <main className="w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center bg-background">
        <div className="w-full max-w-6xl mx-auto">
          <DashboardContent
            activeView={activeView}
            onViewChange={handleViewChange}
          />
        </div>
      </main>
    </div>
  );
} 