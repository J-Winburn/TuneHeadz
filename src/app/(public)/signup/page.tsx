"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("Please fill in all required fields");
      return;
    }
    const normalizedUsername = formData.username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      setError("Username must be 3-20 characters and can only use letters, numbers, and underscores.");
      return;
    }


    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured()) {
        throw new Error(
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
        );
      }

      const { data, error: signUpError } = await getSupabase().auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone || null,
            username: normalizedUsername,
          },
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message || "Sign up failed");
      }

      if (!data.user) {
        throw new Error("Sign up failed. Please try again.");
      }

      try {
        await getSupabase().from("user_profiles").upsert(
          {
            user_id: data.user.id,
            username: normalizedUsername,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone || null,
            display_name: `${formData.firstName} ${formData.lastName}`.trim(),
          },
          { onConflict: "user_id" },
        );
      } catch {
        // Best effort; profile row can still be created later from edit profile.
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(251,61,147,0.14),transparent_32%),#07090f] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to TuneHeadz!</h1>
          <p className="text-zinc-400 mb-4">Your account has been created successfully.</p>
          <p className="text-sm text-zinc-500">Check your email to confirm your account, then sign in.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(251,61,147,0.14),transparent_32%),#07090f] py-12">
      <div className="th-shell">
        <div className="th-surface mx-auto w-full max-w-md p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-[#8ea5b4]">Join the community</p>
          <h1 className="mb-2 mt-2 text-5xl leading-none">Create Account</h1>
          <p className="mb-6 text-sm text-[#9ab0be]">Start logging your favorite tracks</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="th-form-label">
                First Name *
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                className="th-input"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="th-form-label">
                Last Name *
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                className="th-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="th-form-label">
                Username *
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="yourusername"
                value={formData.username}
                onChange={handleChange}
                className="th-input"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="th-form-label">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="th-input"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="th-form-label">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                className="th-input"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="th-form-label">
                Password *
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="th-input"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="th-form-label">
                Confirm Password *
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="th-input"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="th-btn w-full"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <Link href="/signin" className="font-medium text-[#fb3d93] hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
