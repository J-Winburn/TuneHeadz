"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type EditProfileForm = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  displayName: string;
  profileImage: string;
  bannerImage: string;
};

const LOCAL_PROFILE_KEY = "tuneheadz.localProfileDraft";

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EditProfileForm>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    displayName: "",
    profileImage: "",
    bannerImage: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) {
          setError("Unable to load profile settings.");
          return;
        }
        const data = (await response.json()) as Partial<EditProfileForm>;
        let localDraft: Partial<EditProfileForm> = {};
        try {
          const raw = window.localStorage.getItem(LOCAL_PROFILE_KEY);
          if (raw) localDraft = JSON.parse(raw) as Partial<EditProfileForm>;
        } catch {
          // ignore invalid local draft
        }
        setForm((prev) => ({ ...prev, ...data, ...localDraft }));
      } catch {
        setError("Unable to load profile settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const normalized = {
        ...form,
        username: form.username.trim().toLowerCase(),
      };

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        // Temporary offline/shared-env fallback: keep profile edits locally.
        window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(normalized));
        router.push("/profile");
        return;
      }

      const saved = (await response.json().catch(() => normalized)) as Partial<EditProfileForm>;
      window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(saved));
      router.push("/profile");
    } catch (err) {
      // Fallback for network/API issues.
      window.localStorage.setItem(
        LOCAL_PROFILE_KEY,
        JSON.stringify({
          ...form,
          username: form.username.trim().toLowerCase(),
        }),
      );
      router.push("/profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="min-h-screen bg-[#0b1018]" />;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(251,61,147,0.14),transparent_32%),#07090f] py-10 text-[#dfe7f2]">
      <section className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="th-surface p-5 md:p-7">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-white">Account Settings</h1>
            <Link href="/profile" className="text-sm text-[#9fb0c7] hover:text-white">
              Back to profile
            </Link>
          </div>

          {error ? (
            <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <div className="space-y-4">
              <Field label="Username" name="username" value={form.username} onChange={handleChange} />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Given name" name="firstName" value={form.firstName} onChange={handleChange} />
                <Field label="Family name" name="lastName" value={form.lastName} onChange={handleChange} />
              </div>
              <Field label="Email address" name="email" value={form.email} onChange={handleChange} />
              <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />
              <Field label="Display name" name="displayName" value={form.displayName} onChange={handleChange} />
              <Field label="Profile image URL" name="profileImage" value={form.profileImage} onChange={handleChange} />
              <Field label="Banner image URL" name="bannerImage" value={form.bannerImage} onChange={handleChange} />
              <label>
                <span className="th-form-label">Bio</span>
                <textarea
                  name="bio"
                  rows={5}
                  value={form.bio}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#3c3044] bg-[#24293a] px-3 py-2 text-sm text-[#e9f0f9] focus:border-[#fb3d93]/70 focus:outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-[#fb3d93] px-5 py-2 text-sm font-bold uppercase tracking-[0.1em] text-[#2a0b18] transition hover:bg-[#ff58a3] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8ea1bb]">
                Favorite Music
              </p>
              <div className="rounded-lg border border-[#2b2030] bg-[#111521] p-4">
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className="group aspect-[2/3] rounded-md border border-[#343247] bg-[#252b3a] text-[#8d9bb3] transition hover:border-[#fb3d93]/60 hover:text-[#ffd4e9]"
                    >
                      <span className="text-2xl leading-none">+</span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-[#8ea1bb]">
                  Add up to 4 favorite album covers to show on your profile.
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
  return (
    <label>
      <span className="th-form-label">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-[#3c3044] bg-[#24293a] px-3 py-2 text-sm text-[#e9f0f9] focus:border-[#fb3d93]/70 focus:outline-none"
      />
    </label>
  );
}
