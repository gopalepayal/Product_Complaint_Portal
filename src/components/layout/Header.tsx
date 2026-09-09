"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FilePlus2, LogOut, Menu, Search, ShieldCheck, UserCircle, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/complaints", label: "Complaints" },
  { href: "/products", label: "Products" },
  { href: "/about#how-it-works", label: "How It Works" },
  { href: "/about#help", label: "Help" },
];

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm"><ShieldCheck className="h-5 w-5" /></span>
          <span className="leading-tight"><strong className="block text-base font-extrabold tracking-tight text-slate-950">Product Complaint Portal</strong><span className="text-xs font-medium text-slate-500">Your voice. Better products.</span></span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => <Link key={link.href} href={link.href} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${pathname === link.href ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50 hover:text-teal-800"}`}>{link.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/complaints" aria-label="Search complaints" className="rounded-lg p-2 text-slate-600 hover:bg-slate-50 hover:text-teal-700"><Search className="h-5 w-5" /></Link>
          {session ? <><Link href={((session.user as { role?: string }).role === "ADMIN" || (session.user as { role?: string }).role === "MODERATOR") ? "/admin" : "/dashboard"} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><UserCircle className="h-5 w-5" />Account</Link><button type="button" onClick={() => signOut({ callbackUrl: "/" })} aria-label="Sign out" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"><LogOut className="h-5 w-5" /></button></> : <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Log in</Link>}
          <Link href="/submit" className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-orange-700"><FilePlus2 className="h-4 w-4" />File a Complaint</Link>
        </div>
        <button type="button" aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden">{mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
      </div>
      {mobileOpen && <nav className="border-t border-slate-100 bg-white px-4 py-3 shadow-lg md:hidden" aria-label="Mobile navigation"><div className="space-y-1">{navLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800">{link.label}</Link>)}<Link href="/submit" onClick={() => setMobileOpen(false)} className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-bold text-white"><FilePlus2 className="h-4 w-4" />File a Complaint</Link></div></nav>}
    </header>
  );
}
