import Link from "next/link";
import { FeedbackButton } from "./FeedbackButton";

export default function Footer() {
  return (
    <footer className="w-full bg-[#10172a] text-white border-t border-border mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row md:justify-between md:items-start gap-8">
        {/* Left: Logo and tagline */}
        <div className="flex flex-col items-start gap-3 md:w-1/3">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a21caf] text-white font-bold text-lg">zK</span>
            <span className="font-semibold text-lg tracking-tight">zKkeynest</span>
          </div>
          <div className="text-sm text-muted-foreground mb-2">Secure API key management with zero-knowledge encryption.</div>
          <div className="flex items-center gap-3 mt-2">
            <FeedbackButton />
          </div>
        </div>
        {/* Center: Product links */}
        <div className="flex flex-col md:w-1/3 gap-2">
          <div className="font-semibold mb-2"></div>
          <Link href="#how-it-works" className="text-muted-foreground hover:text-white transition-colors">How it works</Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-white transition-colors">Pricing</Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-white transition-colors">Privicy Policy</Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-white transition-colors">Terms of Service</Link>
        </div>

      </div>
      <div className="border-t border-border mt-6 pt-6 pb-4 px-4 text-xs text-muted-foreground flex flex-col md:flex-row md:justify-between max-w-6xl mx-auto">
        <div>© {new Date().getFullYear()} zKkeynest. All rights reserved.</div>
      </div>
    </footer>
  );
} 