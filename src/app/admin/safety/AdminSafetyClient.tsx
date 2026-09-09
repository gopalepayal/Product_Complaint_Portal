"use client";

import React, { useState } from "react";
import { Plus, Edit2, Archive, CheckCircle, AlertTriangle } from "lucide-react";

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

// Hardcoded products to mimic the official ones we added in /products
const PRODUCTS = [
  "Joint Pain Lozenges",
  "Skin Care Lozenges",
  "Summer Care Lozenges",
  "Old Pain Lozenges",
  "Hair Care Lozenges"
];

export default function AdminSafetyClient({ initialNotices }: { initialNotices: Notice[] }) {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  
  const [formData, setFormData] = useState({
    productName: PRODUCTS[0],
    batchNumber: "",
    issueType: "",
    severity: "ADVISORY",
    affectedArea: "",
    consumerAction: "",
    status: "ACTIVE"
  });

  const [loading, setLoading] = useState(false);

  const openNew = () => {
    setEditingNotice(null);
    setFormData({
      productName: PRODUCTS[0],
      batchNumber: "",
      issueType: "",
      severity: "ADVISORY",
      affectedArea: "",
      consumerAction: "",
      status: "ACTIVE"
    });
    setIsModalOpen(true);
  };

  const openEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      productName: notice.productName,
      batchNumber: notice.batchNumber || "",
      issueType: notice.issueType,
      severity: notice.severity,
      affectedArea: notice.affectedArea || "",
      consumerAction: notice.consumerAction,
      status: notice.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingNotice) {
        // Update
        const res = await fetch("/api/safety", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingNotice.id, ...formData }),
        });
        const json = await res.json();
        if (json.success) {
          setNotices(notices.map(n => n.id === editingNotice.id ? json.notice : n));
          setIsModalOpen(false);
        }
      } else {
        // Create
        const res = await fetch("/api/safety", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          setNotices([json.notice, ...notices]);
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/safety", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (json.success) {
        setNotices(notices.map(n => n.id === id ? json.notice : n));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">All Notices</h2>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          <Plus className="h-4 w-4" /> Create Notice
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
            <tr>
              <th className="px-6 py-4">Notice ID</th>
              <th className="px-6 py-4">Product / Batch</th>
              <th className="px-6 py-4">Issue Type</th>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {notices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No safety notices exist. Click "Create Notice" to add one.
                </td>
              </tr>
            ) : (
              notices.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-700">{n.noticeNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{n.productName}</div>
                    <div className="text-xs text-slate-500">{n.batchNumber ? `Batch: ${n.batchNumber}` : 'All Batches'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{n.issueType}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                      n.severity === 'RECALL' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {n.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                      n.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 
                      n.status === 'RESOLVED' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(n)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {n.status === 'ACTIVE' && (
                        <button onClick={() => updateStatus(n.id, 'RESOLVED')} className="p-1.5 text-slate-400 hover:text-green-600 transition-colors" title="Mark Resolved">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {n.status !== 'ARCHIVED' && (
                        <button onClick={() => updateStatus(n.id, 'ARCHIVED')} className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors" title="Archive">
                          <Archive className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingNotice ? 'Edit Safety Notice' : 'Create Safety Notice'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Product Name</label>
                  <select 
                    value={formData.productName}
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    required
                  >
                    {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Batch / Lot Number (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                    placeholder="Leave empty for all batches"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Severity</label>
                  <select 
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="ADVISORY">Safety Advisory (Amber)</option>
                    <option value="RECALL">Urgent Recall (Red)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="ACTIVE">Active / Published</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="ARCHIVED">Archived (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Issue Type</label>
                <input 
                  type="text" 
                  value={formData.issueType}
                  onChange={(e) => setFormData({...formData, issueType: e.target.value})}
                  placeholder="e.g. Packaging defect, Incorrect labeling"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Affected Area (Optional)</label>
                <input 
                  type="text" 
                  value={formData.affectedArea}
                  onChange={(e) => setFormData({...formData, affectedArea: e.target.value})}
                  placeholder="e.g. North India, All regions"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Consumer Action Required</label>
                <textarea 
                  value={formData.consumerAction}
                  onChange={(e) => setFormData({...formData, consumerAction: e.target.value})}
                  placeholder="What should the consumer do? e.g. Stop using immediately and return for replacement."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm min-h-[100px]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2.5 bg-slate-900 text-white font-bold hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Notice'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
