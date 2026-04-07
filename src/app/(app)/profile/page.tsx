"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    timezone: "UTC",
    displayName: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            bio: data.bio || "",
            timezone: data.timezone || "UTC",
            displayName: data.displayName || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Failed to update profile" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while saving your profile" });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-pink-500 hover:text-pink-400 transition text-sm">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-pink-500 px-6 py-8">
            <div className="flex items-center gap-4">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.displayName}
                  className="w-20 h-20 rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-zinc-700 border-4 border-white flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">{user.displayName || `${user.firstName || "User"}`}</h1>
                <p className="text-pink-100">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-500/20 text-green-200 border border-green-500/50"
                    : "bg-red-500/20 text-red-200 border border-red-500/50"
                }`}
              >
                {message.text}
              </div>
            )}

            {!isEditing ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">First Name</label>
                      <p className="text-zinc-100">{user.firstName || "—"}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Last Name</label>
                      <p className="text-zinc-100">{user.lastName || "—"}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Email</label>
                      <p className="text-zinc-100">{user.email || "—"}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Phone</label>
                      <p className="text-zinc-100">{user.phone || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-zinc-400 mb-1">Bio</label>
                      <p className="text-zinc-100">{user.bio || "—"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">Preferences</h2>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Timezone</label>
                    <p className="text-zinc-100">{user.timezone || "UTC"}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-6 px-4 py-2 rounded-lg font-medium text-black transition"
                  style={{ backgroundColor: "#fb3d93" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e63a85")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fb3d93")}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-zinc-300 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-zinc-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-zinc-300 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="timezone" className="block text-sm font-medium text-zinc-300 mb-1">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">EST (Eastern Standard)</option>
                      <option value="CST">CST (Central Standard)</option>
                      <option value="MST">MST (Mountain Standard)</option>
                      <option value="PST">PST (Pacific Standard)</option>
                      <option value="GMT">GMT</option>
                      <option value="CET">CET (Central European)</option>
                      <option value="IST">IST (Indian Standard)</option>
                      <option value="JST">JST (Japan Standard)</option>
                      <option value="AEST">AEST (Australia Eastern)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg font-medium text-black transition disabled:opacity-50"
                    style={{ backgroundColor: "#fb3d93" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e63a85")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fb3d93")}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg font-medium border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
