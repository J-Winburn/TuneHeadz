"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const isLight = document.body.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
  }, [open]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Sign in failed");
      }

      // Success - redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md ${theme === "light" ? "bg-white border-zinc-200" : "bg-zinc-950 border-zinc-800"}`}>
        <DialogHeader>
          <DialogTitle className={theme === "light" ? "text-black" : "text-white"}>Welcome to TuneHeadz</DialogTitle>
          <DialogDescription className={theme === "light" ? "text-zinc-600" : "text-zinc-400"}>The social app for music lovers</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Continue with Google */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setError("Google sign in coming soon")}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <text x="4" y="18" fontSize="12" fill="currentColor">
                G
              </text>
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-500">Or</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleSignIn} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email" className={theme === "light" ? "text-black" : "text-zinc-200"}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Continue with Email"}
            </Button>
          </form>

          {/* Sign up link */}
          <p className={`text-center text-sm ${theme === "light" ? "text-zinc-600" : "text-zinc-400"}`}>
            Don't have an account?{" "}
            <button
              onClick={() => {
                onOpenChange(false);
                window.location.href = "/signup";
              }}
              className="text-[#fb3d93] hover:underline font-medium"
            >
              Create account
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
