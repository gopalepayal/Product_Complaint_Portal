"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-white">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors focus:outline-none"
          >
            <span className={`font-semibold text-sm leading-snug pr-4 ${open === i ? "text-teal-700" : "text-slate-800"}`}>
              {faq.q}
            </span>
            <ChevronDown className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-180 text-teal-600" : "text-slate-400"}`} />
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4 bg-slate-50">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
