"use client";

import Link from "next/link";
import {
  ShieldCheck, HeartPulse, ClipboardList, CheckCircle2, Search,
  Users, Building2, Lock, AlertTriangle, ArrowRight, ChevronRight, FileCheck
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="bg-white border-b border-slate-200 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
            <HeartPulse className="h-4 w-4" />
              <span>Independent Consumer Platform</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            About the Product Complaint Portal
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Product Complaint Portal is an independent, multi-brand platform for reporting, tracking, and understanding product-related complaints across India. It gives every consumer a structured way to be heard and helps responsible brands respond transparently.
          </p>
        </div>
      </section>

      {/* What is it */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">What is TrustPortal?</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Product Complaint Portal is a secure public platform for reporting issues with products from any legitimate brand, including electronics, appliances, personal care, food, and everyday consumer goods.
              </p>
              <p className="text-slate-600 leading-relaxed">
                  Unlike a generic feedback form, every complaint enters a formal workflow: it is logged, reviewed, published when appropriate, and tracked with clear status updates and an audit trail.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-4">
              {[
                { icon: ClipboardList, label: "Structured complaint submission with evidence upload" },
                { icon: Search, label: "Real-time complaint tracking using a unique complaint ID" },
                { icon: CheckCircle2, label: "Formal verification and investigation workflow" },
                { icon: Building2, label: "Direct brand/manufacturer response mechanism" },
                { icon: FileCheck, label: "Persistent audit trail for every status change" },
                { icon: Lock, label: "Secure, role-based access for admins and consumers" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
                    <Icon className="h-5 w-5 text-blue-700" />
                  </div>
                  <p className="text-slate-700 text-sm leading-snug pt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why it exists */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why This Portal Exists</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Product safety and consumer transparency are shared responsibilities. This portal helps uphold them at every step.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: AlertTriangle,
                title: "Consumer Safety",
                desc: "When a product causes harm, inconvenience, or does not meet expected quality standards, consumers deserve a formal channel to report it — not just a customer care phone line that may go unanswered."
              },
              {
                icon: ShieldCheck,
                title: "Regulatory Compliance",
                desc: "Healthcare products in India are governed by the Drugs and Cosmetics Act and regulatory guidelines from bodies such as CDSCO. Proper complaint logging and resolution is a compliance requirement, not optional."
              },
              {
                icon: HeartPulse,
                title: "Continuous Improvement",
                desc: "Aggregated complaint data helps brands and consumers identify recurring quality issues and make better-informed decisions."
              }
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How Complaints Are Handled</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Every complaint follows a defined, multi-stage workflow. No complaint is ignored, lost, or silently closed.
            </p>
          </div>
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              { step: "01", title: "Consumer Submits a Complaint", desc: "After registering and verifying their email via OTP, a consumer submits a detailed complaint — including product details, batch/lot number, purchase information, incident description, severity, and optional evidence files such as photos or receipts." },
              { step: "02", title: "Unique Complaint ID Assigned", desc: "Every complaint is immediately assigned a unique Complaint ID (e.g., CMP-2026-000001) so that the consumer can track it at any time without needing to log in." },
              { step: "03", title: "Moderation Review", desc: "Our moderation team reviews the submission for completeness, relevance, privacy, and platform guidelines." },
              { step: "04", title: "Brand Response", desc: "Verified representatives of the relevant brand can respond publicly and provide status updates where appropriate." },
              { step: "05", title: "Resolution Tracking", desc: "Consumers and visitors can follow the public status timeline as the complaint moves toward a documented resolution." },
              { step: "06", title: "Resolution & Closure", desc: "Once the consumer issue is addressed, the complaint is marked as Resolved and eventually Closed. All status transitions are permanently logged with timestamps and responsible party details." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl border border-slate-200 p-6 flex gap-5">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
                    {step}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Privacy &amp; Security</h2>
              <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                <p>
                  Your complaint data — including your name, contact information, product details, and complaint description — is used solely for the purpose of investigating and resolving your complaint.
                </p>
                <p>
                  Personal information is never shared with third parties outside the complaint resolution process. Your email is used only for OTP verification, complaint acknowledgement, and status update notifications.
                </p>
                <p>
                  Complaint data is stored in a secure database. Access is restricted to authorised platform administrators and verified representatives of the relevant brand.
                </p>
                <p>
                  Passwords are never stored in plain text. All passwords are securely hashed using industry-standard bcrypt algorithms. OTP codes for email verification are similarly hashed and never stored in plain form.
                </p>
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  The platform’s privacy, content, and data-handling policies are published for consumers before they submit information.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { icon: Lock, title: "End-to-End Authentication", desc: "Email OTP verification, secure JWT sessions, and role-based access control ensure only authorised users access complaint data." },
                { icon: ShieldCheck, title: "Consumer Ownership Enforcement", desc: "Consumers can only view and access their own complaints. No consumer can access another consumer's complaint data by manipulating URLs or API calls." },
                { icon: FileCheck, title: "Complete Audit Trail", desc: "Every status change, assignment, note, and response is permanently logged with the responsible user's ID, timestamp, and reason." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex gap-4">
                  <div className="bg-blue-100 p-2.5 rounded-lg flex-shrink-0 h-fit">
                    <Icon className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{title}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to submit a complaint?</h2>
          <p className="text-slate-600 mb-8">Register for a consumer account and submit a complaint. You will receive a unique tracking ID immediately.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-sm transition-colors"
            >
              Create Account <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl border border-slate-200 shadow-sm transition-colors"
            >
              Track Existing Complaint <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
