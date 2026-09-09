"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const columns = [
  { title: "Platform", links: [["Home", "/"], ["Complaints", "/complaints"], ["Brands", "/products"], ["Products", "/products"], ["How It Works", "/about#how-it-works"]] },
  { title: "Consumers", links: [["File a Complaint", "/submit"], ["My Complaints", "/dashboard"], ["Track Complaint", "/track"], ["Safety Information", "/safety"]] },
  { title: "Support", links: [["Help Centre", "/about#help"], ["Contact", "/about#contact"], ["Grievance Officer", "/about#grievance"], ["Report Content", "/complaints"]] },
  { title: "Legal", links: [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Content Guidelines", "/about#guidelines"]] },
];

export default function Footer() {
  if (usePathname().startsWith("/admin")) return null;
  return <footer className="border-t border-slate-800 bg-slate-950 text-slate-300"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5"><div className="lg:col-span-1"><div className="mb-4 text-lg font-extrabold text-white">Product Complaint Portal</div><p className="text-sm leading-6 text-slate-400">An independent public platform for sharing product concerns, finding patterns, and making consumer voices count across India.</p></div>{columns.map((column) => <div key={column.title}><h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">{column.title}</h2><ul className="space-y-3">{column.links.map(([label, href]) => <li key={href + label}><Link href={href} className="text-sm hover:text-white">{label}</Link></li>)}</ul></div>)}</div><div className="mt-12 border-t border-slate-800 pt-6 text-xs text-slate-500">© {new Date().getFullYear()} Product Complaint Portal. Built for transparent consumer information in India.</div></div></footer>;
}
