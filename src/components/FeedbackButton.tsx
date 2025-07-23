"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { FeedbackDialog } from "./FeedbackDialog";

export function FeedbackButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        className={className}
        onClick={() => setOpen(true)}
        aria-label="Send Feedback"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Feedback
      </Button>
      <FeedbackDialog open={open} onOpenChange={setOpen} />
    </>
  );
} 