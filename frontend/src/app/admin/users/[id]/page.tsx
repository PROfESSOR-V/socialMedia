"use client";

import { useEffect, useState, use } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User as UserIcon, MapPin, Phone, Mail, Calendar, Shield, AlertCircle, RefreshCw } from "lucide-react";
import apiClient from "@/lib/apiClient";

interface Address {
  name: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface UserData {
  id: string;
  name: string;
  mobileNumber: string;
  email?: string;
  role: string;
  addresses: Address[];
  createdAt: string;
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const userId = params.id;
  const { token, user, _hasHydrated } = useStore();
  const router = useRouter();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/api/user/${userId}`);
      const data = response.data;

      if (data.success) {
        setUserData(data.data);
      } else {
        throw new Error(data.message || "Failed to parse user data");
      }
    } catch (err: any) {
      console.error("Error fetching user:", err);
      if (err.response?.status === 404) setError("User not found");
      else setError(err.response?.data?.message || err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user || user?.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    if (userId) {
      fetchUser();
    }
  }, [token, user, router, userId, _hasHydrated]);

  if (error) {
    return (
      <div className="space-y-6">
        <Link 
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-black transition-colors bg-white px-3 py-1.5 rounded-lg border border-zinc-200 shadow-sm w-fit mr-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center max-w-md mx-auto mt-10">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load user</h3>
          <p className="text-red-600 mb-6 text-sm">{error}</p>
          <button
            onClick={fetchUser}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !userData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="w-32 h-8 bg-zinc-200 rounded-lg"></div>
        <div className="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start shadow-sm border border-zinc-200">
          <div className="w-24 h-24 bg-zinc-200 rounded-full shrink-0"></div>
          <div className="space-y-4 w-full">
            <div className="h-8 bg-zinc-200 rounded w-1/3"></div>
            <div className="h-4 bg-zinc-200 rounded w-1/4"></div>
            <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/users"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif text-black tracking-tight">User Details</h1>
            <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
              <span className="font-mono text-xs bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600">ID: {String((userData.id as any)?.timestamp || userData.id)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-zinc-800 to-black w-full absolute top-0 left-0"></div>
        
        <div className="px-6 md:px-8 pb-8 pt-16 relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-zinc-100 flex items-center justify-center shrink-0 shadow-md">
            <UserIcon className="w-12 h-12 md:w-16 md:h-16 text-zinc-300" />
          </div>
          
          <div className="flex-1 space-y-4 mt-2 md:mt-10">
            <div>
              <h2 className="text-3xl font-serif font-medium text-black tracking-tight">
                {(userData.name && userData.name !== "Unknown") ? userData.name : (userData.addresses && userData.addresses.length > 0 ? userData.addresses[0].name : "Unknown User")}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                <span className="inline-flex items-center gap-1.5 text-zinc-600 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-full font-medium">
                  <Shield className="w-3.5 h-3.5" />
                  {userData.role}
                </span>
                <span className="inline-flex items-center gap-1.5 text-zinc-500">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(userData.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Mobile Number</p>
                  <p className="text-sm text-zinc-900 font-medium">{userData.mobileNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Email Address</p>
                  <p className="text-sm text-zinc-900 font-medium">{userData.email || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <h3 className="text-lg font-medium text-black px-2 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-zinc-400" />
        Saved Addresses ({userData.addresses ? userData.addresses.length : 0})
      </h3>
      
      {(!userData.addresses || userData.addresses.length === 0) ? (
        <div className="bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 p-12 text-center text-zinc-500">
          <MapPin className="w-8 h-8 mx-auto mb-3 text-zinc-300" />
          <p>This user has no saved addresses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userData.addresses.map((address, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium text-black">{address.name || "Address"}</h4>
                {index === 0 && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md">Default</span>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-zinc-600 flex-1">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>
                    {address.street}<br />
                    {address.city}{address.state ? `, ${address.state}` : ''} {address.zip}<br />
                    {address.country}
                  </span>
                </p>
                <p className="flex items-center gap-2 pt-2 border-t border-zinc-100 mt-2">
                  <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                  {address.phoneNumber}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
