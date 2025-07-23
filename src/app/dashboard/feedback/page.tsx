"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { isAdmin } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { MessageCircle, Bug, Lightbulb, HelpCircle, Mail, Calendar, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Feedback {
  id: string;
  type: "bug" | "suggestion" | "other";
  message: string;
  email?: string;
  userId?: string;
  createdAt: { seconds: number; nanoseconds: number };
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "bug":
      return <Bug className="h-4 w-4 text-red-500" />;
    case "suggestion":
      return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    case "other":
      return <HelpCircle className="h-4 w-4 text-blue-500" />;
    default:
      return <MessageCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case "bug":
      return "destructive";
    case "suggestion":
      return "default";
    case "other":
      return "secondary";
    default:
      return "outline";
  }
};

export default function FeedbackAdminPage() {
  const { user, isLoaded } = useUser();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    if (!isLoaded) return;
    
    const adminEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
    if (!user || !isAdmin(adminEmail)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/feedback");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch feedback");
      }
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    try {
      setDeletingId(feedbackId);
      const res = await fetch(`/api/feedback?id=${feedbackId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete feedback");
      }
      
      // Remove from local state
      setFeedbacks(prev => prev.filter(fb => fb.id !== feedbackId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete feedback");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [user, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-screen overflow-x-hidden bg-background text-foreground font-sans flex flex-col">
        <Navbar />
        <div className="min-h-screen w-full bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const adminEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
  if (!user || !isAdmin(adminEmail)) {
    return (
      <div className="min-h-screen w-screen overflow-x-hidden bg-background text-foreground font-sans flex flex-col">
        <Navbar />
        <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <MessageCircle className="h-4 w-4" />
            <div>
              <h3 className="font-semibold">Access Denied</h3>
              <p className="text-sm mt-1">You do not have permission to view this page.</p>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  const bugCount = feedbacks.filter(f => f.type === "bug").length;
  const suggestionCount = feedbacks.filter(f => f.type === "suggestion").length;
  const otherCount = feedbacks.filter(f => f.type === "other").length;

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-background text-foreground font-sans flex flex-col">
      <Navbar />
      <main className="w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center bg-background">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">User Feedback</h1>
                  <p className="text-muted-foreground">Monitor and respond to user feedback</p>
                </div>
              </div>
              <Button 
                onClick={fetchFeedbacks} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{feedbacks.length}</p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bugs</p>
                      <p className="text-2xl font-bold text-red-600">{bugCount}</p>
                    </div>
                    <Bug className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Suggestions</p>
                      <p className="text-2xl font-bold text-yellow-600">{suggestionCount}</p>
                    </div>
                    <Lightbulb className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Other</p>
                      <p className="text-2xl font-bold text-blue-600">{otherCount}</p>
                    </div>
                    <HelpCircle className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <MessageCircle className="h-4 w-4" />
              <div>
                <h3 className="font-semibold">Error</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span>Loading feedback...</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && feedbacks.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
                  <p className="text-muted-foreground">
                    When users submit feedback, it will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback List */}
          {!loading && feedbacks.length > 0 && (
            <div className="space-y-4">
              {feedbacks.map((fb) => (
                <Card key={fb.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(fb.type)}
                        <div>
                          <CardTitle className="text-lg capitalize">{fb.type} Report</CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {fb.email || "Anonymous"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(fb.createdAt.seconds * 1000).toLocaleDateString()}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getTypeBadgeVariant(fb.type) as any} className="capitalize">
                          {fb.type}
                        </Badge>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              disabled={deletingId === fb.id}
                            >
                              {deletingId === fb.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Delete Feedback
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this {fb.type} feedback? This action cannot be undone.
                                <div className="mt-3 p-3 bg-muted rounded-lg border-l-4 border-l-destructive/20">
                                  <p className="text-sm font-medium">Preview:</p>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {fb.message}
                                  </p>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteFeedback(fb.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Feedback
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-l-primary/20">
                      <p className="whitespace-pre-line text-sm leading-relaxed">{fb.message}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">
                        Submitted {new Date(fb.createdAt.seconds * 1000).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        ID: {fb.id.slice(-8)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
