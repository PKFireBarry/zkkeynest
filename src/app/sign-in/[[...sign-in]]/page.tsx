import ClerkLoadingWrapper from "@/components/ClerkLoadingWrapper";
import Link from "next/link";

export default function SignInPage() {
  const appearance = {
    elements: {
      formButtonPrimary: 
        "bg-gradient-to-r from-[#6366f1] to-[#a21caf] text-white shadow-md hover:opacity-90 transition-opacity",
      card: "shadow-none bg-transparent",
      headerTitle: "hidden",
      headerSubtitle: "hidden",
      socialButtonsBlockButton: 
        "bg-background border border-border text-foreground hover:bg-muted transition-colors",
      formFieldInput: 
        "bg-background border border-border text-foreground focus:border-[#6366f1] focus:ring-[#6366f1]",
      formFieldLabel: "text-foreground",
      footerActionLink: "text-[#6366f1] hover:text-[#a21caf]",
      dividerLine: "bg-border",
      dividerText: "text-muted-foreground",
    },
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center px-2 sm:px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="zKkeynest logo" className="w-8 h-8 rounded-md object-contain" />
            <span className="font-semibold text-xl tracking-tight">zKkeynest</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to access your secure API key vault</p>
        </div>
        
        <ClerkLoadingWrapper mode="sign-in" appearance={appearance} />
        
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