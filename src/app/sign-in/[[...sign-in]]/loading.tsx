// loading.tsx for sign-in route

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" aria-label="Loading" />
        <span className="text-muted-foreground text-sm">Loading sign-in…</span>
      </div>
    </div>
  );
} 