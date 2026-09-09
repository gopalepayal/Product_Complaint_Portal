"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

export default function TrackForm() {
  const router = useRouter();
  const [trackId, setTrackId] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId.trim()) router.push(`/track?id=${encodeURIComponent(trackId.trim())}`);
  };

  return (
    <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={trackId}
          onChange={e => setTrackId(e.target.value)}
          placeholder="e.g. PCP-2026-000001"
          className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 text-base outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 transition-all font-medium"
        />
      </div>
      <button 
        type="submit" 
        className="w-full sm:w-auto px-7 py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg transition-all text-sm whitespace-nowrap"
      >
        Track Status
      </button>
    </form>
  );
}
