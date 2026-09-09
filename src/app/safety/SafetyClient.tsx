"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShieldAlert, AlertTriangle, Info, CheckCircle, Clock, ExternalLink, ShieldCheck } from "lucide-react";

type Notice = {
  id: string;
  noticeNumber: string;
  productName: string;
  productId: string | null;
  batchNumber: string | null;
  issueType: string;
  severity: string;
  affectedArea: string | null;
  consumerAction: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
};

export default function SafetyClient({ initialNotices }: { initialNotices: Notice[] }) {
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [searchProduct, setSearchProduct] = useState("");
  const [searchBatch, setSearchBatch] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResult, setSearchResult] = useState<Notice | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    
    if (!searchProduct.trim() && !searchBatch.trim()) {
      setSearchResult(null);
      return;
    }

    const found = initialNotices.find((n) => {
      const matchProduct = searchProduct ? n.productName.toLowerCase().includes(searchProduct.toLowerCase()) : true;
      const matchBatch = searchBatch ? (n.batchNumber && n.batchNumber.toLowerCase() === searchBatch.toLowerCase()) : true;
      // We need at least one condition to be explicitly matched if provided, and status ACTIVE or RESOLVED
      return matchProduct && matchBatch && (n.status === "ACTIVE" || n.status === "RESOLVED");
    });

    setSearchResult(found || null);
  };

  const filteredNotices = initialNotices.filter((n) => n.status === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
        
        {/* Left Column: Search & Guidance */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Product Safety Check */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-blue-700 px-6 py-4">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-200" />
                Check Your Product
              </h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6">
                Enter your product name and batch/lot number to check for verified safety notices.
              </p>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Product Name</label>
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="e.g. Joint Pain Lozenges"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Batch / Lot Number</label>
                  <input
                    type="text"
                    value={searchBatch}
                    onChange={(e) => setSearchBatch(e.target.value)}
                    placeholder="e.g. B-12345"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Search Safety Information
                </button>
              </form>

              {hasSearched && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  {searchResult ? (
                    <div className={`p-4 rounded-xl border ${
                      searchResult.severity === 'RECALL' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {searchResult.severity === 'RECALL' ? (
                          <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                        ) : (
                          <ShieldAlert className="h-6 w-6 text-amber-600 flex-shrink-0" />
                        )}
                        <div>
                          <h3 className={`font-bold text-sm ${searchResult.severity === 'RECALL' ? 'text-red-900' : 'text-amber-900'}`}>
                            {searchResult.severity === 'RECALL' ? 'Urgent Recall' : 'Safety Notice'} Found
                          </h3>
                          <p className="text-xs text-slate-700 mt-1">
                            A notice exists for <strong>{searchResult.productName}</strong> {searchResult.batchNumber ? `(Batch: ${searchResult.batchNumber})` : ''}.
                            Please see the active notices list for instructions.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-sm text-green-900">No Active Safety Notice</h3>
                        <p className="text-xs text-green-800 mt-1">
                          We could not find any active safety notices or recalls matching your search criteria.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* CTA to Report a Problem pre-filled with searched items */}
                  <div className="mt-4">
                    <Link
                      href={`/submit?productName=${encodeURIComponent(searchProduct)}&batchNumber=${encodeURIComponent(searchBatch)}`}
                      className="w-full inline-flex items-center justify-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold py-2.5 rounded-xl transition-colors"
                    >
                      Report a Safety Concern <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Consumer Safety Guidance */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-blue-600" />
              Consumer Safety Guidance
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span>Check product name and batch/lot number carefully against any notices.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span>Check expiry information printed on the original packaging.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span>Do not use products with damaged, broken, or tampered seals/packaging.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span>Strictly follow the instructions and dosage on the product label.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span>Report any suspected product quality or safety issues immediately using this portal.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Notice History & Lists */}
        <div className="lg:col-span-2">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              {['ACTIVE', 'RESOLVED', 'ARCHIVED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm font-bold transition-colors ${
                    activeTab === tab 
                      ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50/50' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab === 'ACTIVE' ? 'Active Notices' : tab === 'RESOLVED' ? 'Resolved' : 'Archived'}
                  <span className="ml-2 inline-flex items-center justify-center bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                    {initialNotices.filter(n => n.status === tab).length}
                  </span>
                </button>
              ))}
            </div>

            {/* List */}
            <div className="p-6">
              {filteredNotices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ShieldCheck className="h-16 w-16 text-slate-200 mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    No {activeTab === 'ACTIVE' ? 'Active Safety Notices' : `${activeTab.toLowerCase()} notices`}
                  </h3>
                  <p className="text-slate-500 text-sm max-w-sm">
                    {activeTab === 'ACTIVE' 
                      ? "There are currently no verified safety notices or recalls published on this portal." 
                      : "No records found for this category."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotices.map((notice) => (
                    <div key={notice.id} className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors">
                      <div className={`px-5 py-3 border-b flex justify-between items-center ${
                        notice.severity === 'RECALL' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                      }`}>
                        <div className="flex items-center gap-2">
                          {notice.severity === 'RECALL' ? (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          ) : (
                            <ShieldAlert className="h-4 w-4 text-amber-600" />
                          )}
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            notice.severity === 'RECALL' ? 'text-red-700' : 'text-amber-700'
                          }`}>
                            {notice.severity === 'RECALL' ? 'Urgent Recall' : 'Safety Advisory'}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(notice.publishedAt || notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{notice.productName}</h3>
                            <p className="text-sm text-slate-500 font-mono mt-1">
                              Notice ID: {notice.noticeNumber}
                              {notice.batchNumber && ` • Batch: ${notice.batchNumber}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Type</span>
                            <span className="text-slate-700">{notice.issueType}</span>
                          </div>
                          {notice.affectedArea && (
                            <div>
                              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Affected Area</span>
                              <span className="text-slate-700">{notice.affectedArea}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Consumer Action Required</span>
                          <p className="text-slate-800 text-sm">{notice.consumerAction}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
