"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function FeedbackSection() {
  const { user } = useStore();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setIsSubmitting(true);
      setError("");
      await api.feedback.submit(message);
      setSuccess(true);
      setMessage("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // Don't show feedback block if not logged in
  }

  return (
    <section className="bg-[#f6f6f4] py-16 px-6 relative z-10 border-t border-b border-black/5">
      <div className="container mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-6">
          <MessageSquare className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-3xl font-serif text-primary mb-3">We Value Your Feedback</h2>
        <p className="text-muted-foreground mb-8">
          Help us improve your experience. Let us know what you love or what we could do better.
        </p>

        {success ? (
          <div className="bg-green-50 text-green-800 p-6 rounded-lg border border-green-200">
            <h3 className="font-medium text-lg mb-2">Thank you!</h3>
            <p className="text-sm">Your feedback has been received and helps us grow.</p>
            <Button 
              variant="outline" 
              className="mt-4 bg-white hover:bg-green-50"
              onClick={() => setSuccess(false)}
            >
              Submit another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="text-left space-y-4">
            <div className="relative">
              <textarea
                placeholder="Tell us about your experience..."
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                className="w-full min-h-[120px] resize-y bg-white border border-zinc-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3"
                disabled={isSubmitting}
              />
            </div>
            
            {error && (
              <p className="text-sm text-red-600 px-2">{error}</p>
            )}

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!message.trim() || isSubmitting}
                className="rounded-full px-8 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                {isSubmitting ? "Sending..." : "Send Feedback"}
                {!isSubmitting && <Send className="ml-2 w-4 h-4" />}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
