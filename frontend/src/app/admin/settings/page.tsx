"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import apiClient from "@/lib/apiClient";

export default function SettingsPage() {
  const [mobileProductsPerRow, setMobileProductsPerRow] = useState("1");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await apiClient.get("/api/settings/mobileProductsPerRow");
        if (data && data.value) {
          setMobileProductsPerRow(data.value.toString());
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put("/api/settings/mobileProductsPerRow", {
        value: parseInt(mobileProductsPerRow)
      });
      alert("Settings saved successfully");
    } catch (err) {
      console.error("Failed to save settings", err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-zinc-900 tracking-tight">Store Settings</h1>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-medium text-zinc-900 mb-4">Layout Configuration</h2>
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-700">Mobile Products Per Row</label>
              <p className="text-xs text-zinc-500">Choose whether to display 1 or 2 products per row on mobile devices.</p>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 border border-zinc-200 p-4 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                  <input
                    type="radio"
                    name="mobileProductsPerRow"
                    value="1"
                    checked={mobileProductsPerRow === "1"}
                    onChange={(e) => setMobileProductsPerRow(e.target.value)}
                    className="w-4 h-4 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium">1 Product (Large)</span>
                </label>
                
                <label className="flex items-center gap-2 border border-zinc-200 p-4 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                  <input
                    type="radio"
                    name="mobileProductsPerRow"
                    value="2"
                    checked={mobileProductsPerRow === "2"}
                    onChange={(e) => setMobileProductsPerRow(e.target.value)}
                    className="w-4 h-4 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium">2 Products (Grid)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
