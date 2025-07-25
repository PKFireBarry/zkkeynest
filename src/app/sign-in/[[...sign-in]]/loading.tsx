// loading.tsx for sign-in route
import Link from "next/link";

export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="zKkeynest logo" className="w-8 h-8 rounded-md object-contain" />
            <span className="font-semibold text-xl tracking-tight">zKkeynest</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to access your secure API key vault</p>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-[#a21caf] rounded-full animate-spin" style={{ animationDelay: '0.5s' }} />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground font-medium">
                Loading sign-in form...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Please wait while we prepare your secure authentication
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-[#6366f1] hover:text-[#a21caf] font-medium">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 