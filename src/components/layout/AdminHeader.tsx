"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, UserCircle } from "lucide-react";

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 shadow-md h-[81px]">
      <div className="flex justify-between items-center h-full px-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="flex items-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-sm font-black text-white">PC</span>
            <span className="ml-4 font-bold text-slate-100 text-lg border-l border-slate-700 pl-4">Admin Portal</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <div className="flex items-center gap-2 text-slate-300 font-medium text-sm">
                <UserCircle className="h-5 w-5" />
                <span>{session.user?.name || "Admin"}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-medium transition-colors px-3 py-1.5 rounded-md hover:bg-slate-900"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Log Out</span>
              </button>
            </>
          ) : (
            <Link href="/admin/login" className="text-slate-300 hover:text-white font-medium text-sm">
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
