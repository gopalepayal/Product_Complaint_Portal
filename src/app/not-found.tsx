import Link from "next/link";
import { ShieldCheck, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <ShieldCheck className="h-10 w-10 text-blue-700" />
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            Trust<span className="text-blue-700">Portal</span>
          </span>
        </div>
        <h1 className="text-8xl font-extrabold text-slate-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Page Not Found</h2>
        <p className="text-slate-500 max-w-md mx-auto text-base">
          The page you are looking for does not exist or may have been moved.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition-colors"
        >
          <Home className="h-5 w-5" />
          Back to Home
        </Link>
        <Link
          href="/track"
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl border border-slate-200 shadow-sm transition-colors"
        >
          <Search className="h-5 w-5" />
          Track Complaint
        </Link>
      </div>
    </div>
  );
}
