"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { User, LogOut, Loader2, Plus, MapPin, Save } from "lucide-react";

interface Address {
  name: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface UserProfile {
  id: string;
  name?: string;
  email: string;
  role: string;
  addresses: Address[];
}

export default function ProfilePage() {
  const { user, setLogout, setUser, token } = useStore();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable fields
  const [editName, setEditName] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get("/api/user/profile");
        if (data && data.success) {
          const profileData = data.data;
          setProfile(profileData);
          setEditName(profileData.name || "");
          setAddresses(profileData.addresses || []);
          
          // Sync store name or role if it was empty from login or outdated
          let updatedUser = { ...user };
          let needsUpdate = false;
          if (profileData.name && user.name !== profileData.name) {
            updatedUser.name = profileData.name;
            needsUpdate = true;
          }
          if (profileData.role && user.role !== profileData.role) {
            updatedUser.role = profileData.role;
            needsUpdate = true;
          }
          if (needsUpdate) {
            setUser(updatedUser);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Failed to load profile. Please try logging in again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, user, router, setUser]);

  const handleLogout = () => {
    setLogout();
    router.push("/login");
  };

  const handleAddAddress = () => {
    setAddresses([
      ...addresses,
      { name: "", phoneNumber: "", street: "", city: "", state: "", zip: "", country: "" }
    ]);
  };

  const handleAddressChange = (index: number, field: keyof Address, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index][field] = value;
    setAddresses(newAddresses);
  };

  const handleRemoveAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const { data } = await apiClient.put("/api/user/profile", {
        name: editName,
        addresses: addresses
      });
      if (data && data.success) {
        setSuccessMsg("Profile updated successfully!");
        setProfile(data.data);
        if (user) {
          setUser({ ...user, name: editName });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fefdfb] pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-zinc-900">My Account</h1>
            <p className="text-zinc-500 mt-1">Manage your personal information and addresses</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors w-fit"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {error && (
            <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm">
                {error}
            </div>
        )}
        {successMsg && (
            <div className="p-4 rounded-lg bg-green-50 text-green-700 border border-green-100 text-sm">
                {successMsg}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-zinc-400" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    Email Address <span className="text-zinc-400 normal-case font-normal">(Read Only)</span>
                  </label>
                  <div className="text-zinc-900 font-medium truncate">{profile?.email}</div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm transition-all"
                    placeholder="E.g. Jane Doe"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Addresses Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-zinc-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-zinc-400" />
                  Saved Addresses
                </h2>
                <button 
                  onClick={handleAddAddress}
                  className="text-sm font-medium text-black hover:text-zinc-600 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                  <p className="text-zinc-500 text-sm">No addresses saved yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {addresses.map((address, index) => (
                    <div key={index} className="p-5 rounded-xl border border-zinc-200 relative group">
                      <button 
                        onClick={() => handleRemoveAddress(index)}
                        className="absolute top-4 right-4 text-xs font-medium text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remove
                      </button>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Recipient Name</label>
                          <input
                            type="text"
                            value={address.name}
                            onChange={(e) => handleAddressChange(index, "name", e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Phone Number</label>
                          <input
                            type="text"
                            value={address.phoneNumber}
                            onChange={(e) => handleAddressChange(index, "phoneNumber", e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Street Address</label>
                          <input
                            type="text"
                            value={address.street}
                            onChange={(e) => handleAddressChange(index, "street", e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">City</label>
                          <input
                            type="text"
                            value={address.city}
                            onChange={(e) => handleAddressChange(index, "city", e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">State</label>
                          <input
                            type="text"
                            value={address.state}
                            onChange={(e) => handleAddressChange(index, "state", e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">ZIP Code</label>
                          <input
                            type="text"
                            value={address.zip}
                            onChange={(e) => handleAddressChange(index, "zip", e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Country</label>
                          <input
                            type="text"
                            value={address.country}
                            onChange={(e) => handleAddressChange(index, "country", e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-md text-sm focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
