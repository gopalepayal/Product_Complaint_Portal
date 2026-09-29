"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Check, ChevronRight, Package, AlertCircle, FileImage, User, 
  CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Upload, MapPin
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PRODUCT_CATEGORIES } from "@/lib/productCategories";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

// Validation Schema
const complaintSchema = z.object({
  productName: z.string().min(2, "Product name is required"),
  productId: z.string().optional(),
  brandName: z.string().min(2, "Brand name is required"),
  productCategory: z.string().min(2, "Product category is required"),
  productVariant: z.string().optional(),
  batchNumber: z.string().optional(),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchaseLocation: z.string().min(2, "Purchase location is required"),
  productPrice: z.string().min(1, "Price is required"),
  
  // Complaint Details
  issueCategory: z.string().min(1, "Issue category is required"),
  title: z.string().min(5, "Title is required (min 5 chars)"),
  description: z.string().min(20, "Please provide more details (min 20 chars)"),
  incidentDate: z.string().min(1, "Incident date is required"),
  severity: z.string().min(1, "Severity is required"),
  whatHappened: z.string().min(10, "Please explain what happened"),
  expectedResolution: z.string().min(5, "Expected resolution is required"),
  
  // Consumer Details
  consumerName: z.string().min(2, "Full name is required"),
  consumerEmail: z.string().email("Invalid email address"),
  consumerMobile: z.string().min(10, "Valid mobile number is required"),
  consumerCity: z.string().min(2, "City is required"),
  consumerState: z.string().min(2, "State is required"),

  // Location (optional)
  purchaseCity: z.string().optional(),
  purchaseState: z.string().optional(),
  purchaseCountry: z.string().optional(),
  
  // Meta
  consent: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

const STEPS = [
  { id: 1, name: "Product Info", icon: Package },
  { id: 2, name: "Complaint Details", icon: AlertCircle },
  { id: 3, name: "Evidence", icon: FileImage },
  { id: 4, name: "Your Details", icon: User },
  { id: 5, name: "Review & Submit", icon: CheckCircle2 },
];

function SubmitComplaintPageContent() {
  const searchParams = useSearchParams();
  
  // Extract order-linked prefill values from URL (set by Order Details page)
  const prefillProductName = searchParams.get("productName") || "";
  const prefillCategory    = searchParams.get("category") || "";
  const prefillPurchaseDate = searchParams.get("purchaseDate") || "";
  const prefillPurchaseLocation = searchParams.get("purchaseLocation") || "";
  const prefillProductPrice = searchParams.get("productPrice") || "";
  const prefillBrandName    = searchParams.get("brandName") || "";
  const orderItemId         = searchParams.get("orderItemId") || "";
  const orderNumber         = searchParams.get("orderNumber") || "";

  const isOrderLinked = !!orderItemId;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState("");
  const [returnId, setReturnId] = useState("");
  

  // For simplicity in this demo, handling files in separate state
  const [files, setFiles] = useState<{name: string, size: number, type: string}[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationNote, setLocationNote] = useState("");

  // Catalog Products
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);

  // Previous public complaints for selected product
  const [productComplaints, setProductComplaints] = useState<any[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setCatalogProducts(data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };
    fetchProducts();
  }, []);


  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    mode: "onChange",
    defaultValues: {
      productName: prefillProductName,
      productId: "",
      brandName: prefillBrandName,
      productCategory: prefillCategory,
      purchaseDate: prefillPurchaseDate,
      purchaseLocation: prefillPurchaseLocation,
      productPrice: prefillProductPrice,
    },
  });

  // If navigated from an order, set form fields from URL
  useEffect(() => {
    if (prefillProductName) setValue("productName", prefillProductName);
    if (prefillBrandName)   setValue("brandName", prefillBrandName);
    if (prefillCategory)    setValue("productCategory", prefillCategory);
    if (prefillPurchaseDate) setValue("purchaseDate", prefillPurchaseDate);
    if (prefillPurchaseLocation) setValue("purchaseLocation", prefillPurchaseLocation);
    if (prefillProductPrice) setValue("productPrice", prefillProductPrice);
  }, []);

  const formData = watch();

  // Fetch public complaints whenever a catalog product is selected
  const selectedProductId = formData.productId;
  useEffect(() => {
    if (!selectedProductId || selectedProductId === "OTHER") {
      setProductComplaints([]);
      return;
    }
    setComplaintsLoading(true);
    fetch(`/api/products/${selectedProductId}/complaints`)
      .then(r => r.json())
      .then(data => {
        setProductComplaints(data.complaints ?? []);
      })
      .catch(() => setProductComplaints([]))
      .finally(() => setComplaintsLoading(false));
  }, [selectedProductId]);

  const handleNext = async () => {
    // Validate current step fields before moving next
    let fieldsToValidate: (keyof ComplaintFormValues)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['productName', 'brandName', 'productCategory', 'purchaseDate', 'purchaseLocation', 'productPrice'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['issueCategory', 'title', 'description', 'incidentDate', 'severity', 'whatHappened', 'expectedResolution'];
    } else if (currentStep === 4) {
      fieldsToValidate = ['consumerName', 'consumerEmail', 'consumerMobile', 'consumerCity', 'consumerState'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return;

    setSubmitError("");
    setCurrentStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: f.size,
        type: "Evidence"
      }));
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ComplaintFormValues) => {
    // Guard against double-submission (e.g. rapid double-click).
    // isSubmitting is set back to false in the finally block below.
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = { 
        complaintData: data,
        ...(isOrderLinked && { orderItemId })
      };
      
      const response = await fetch('/api/complaints/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setSubmitError(result.error || "Failed to submit complaint. Please try again.");
        return;
      }

      setComplaintId(result.complaintNumber);
      if (result.returnNumber) {
        setReturnId(result.returnNumber);
      }
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };



  if (isSuccess) {
    if (returnId) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-12 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
            <div className="mx-auto w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
              <Check className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Return request submitted successfully!</h1>
            <p className="text-xl text-slate-600 mb-8 max-w-lg mx-auto">
              We have successfully received your return request and it is now under review.
            </p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-10 max-w-md mx-auto">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Return ID</p>
              <p className="text-3xl font-bold text-slate-900 tracking-wider font-mono">{returnId}</p>
              <div className="mt-6 flex justify-center items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <span className="text-sm font-medium text-blue-700">Status: RETURN REQUESTED</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href={`/track?q=${returnId}`} className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-xl transition-all">
                Track Return
              </Link>
              <Link href="/orders" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-8 py-3 rounded-xl transition-all">
                My Orders
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-12 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          <div className="mx-auto w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
            <Check className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Complaint Submitted</h1>
          <p className="text-xl text-slate-600 mb-8 max-w-lg mx-auto">
            We have successfully received your complaint and it is now under review.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-10 max-w-md mx-auto">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Your Complaint ID</p>
            <p className="text-3xl font-bold text-slate-900 tracking-wider font-mono">{complaintId}</p>
            <div className="mt-6 flex justify-center items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span className="text-sm font-medium text-blue-700">Status: Under Review</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/track" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-xl transition-all">
              Track Complaint
            </Link>
            <Link href="/dashboard" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-8 py-3 rounded-xl transition-all">
              My Complaints
            </Link>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">File a Complaint</h1>
          <p className="text-lg text-slate-600">Provide accurate details to help us resolve your issue quickly.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-300 ease-in-out rounded-full"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            ></div>
            
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-slate-50 transition-colors duration-300 ${isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`mt-2 text-xs font-medium hidden sm:block ${isActive ? 'text-blue-700' : isCompleted ? 'text-green-600' : 'text-slate-400'}`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Area */}
        <div className="bg-white shadow-xl shadow-slate-200/40 rounded-3xl border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit(onSubmit)}>
              
              {/* Step 1: Product Info */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-8">Product Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Product Category *</label>
                      <select 
                        {...register("productCategory", {
                          onChange: (e) => {
                            setValue("productId", "");
                            setValue("productName", "");
                            setValue("brandName", "");
                            setValue("productVariant", "");
                            setValue("productPrice", "");
                          }
                        })}
                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none appearance-none text-slate-900"
                        disabled={isOrderLinked}
                      >
                        <option value="">-- Choose a Category --</option>
                        {PRODUCT_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {errors.productCategory && <p className="text-red-500 text-xs mt-1">{errors.productCategory.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Select Product from Catalog *</label>
                      {isOrderLinked ? (
                        <input {...register("productName")} readOnly className="w-full rounded-lg border-slate-300 shadow-sm px-4 py-3 bg-slate-100 border outline-none text-slate-900 cursor-not-allowed" />
                      ) : (
                        <select 
                          className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none appearance-none text-slate-900"
                          onChange={(e) => {
                            const pId = e.target.value;
                            setValue("productId", pId);
                            if (pId === "OTHER") {
                              setValue("productName", "");
                              setValue("productVariant", "");
                              setValue("productPrice", "");
                              setValue("brandName", "");
                            } else if (pId) {
                              const p = catalogProducts.find(x => x.id === pId);
                              if (p) {
                                setValue("productName", p.name);
                                setValue("productVariant", p.size || "");
                                setValue("productPrice", p.price == null ? "" : String(p.price));
                                setValue("brandName", p.brand?.name || "");
                                trigger(['productName', 'productPrice', 'brandName']);
                              }
                            }
                          }}
                        >
                          <option value="">-- Choose a Product --</option>
                          {catalogProducts.filter(p => !formData.productCategory || p.category === formData.productCategory).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                          <option value="OTHER">Other / Product Not Listed</option>
                        </select>
                      )}
                      
                      {/* Hidden field to keep productName required validation working if selected */}
                      <input type="hidden" {...register("productName")} />
                      <input type="hidden" {...register("productId")} />
                      {errors.productName && <p className="text-red-500 text-xs mt-1">Please select a product.</p>}
                    </div>
                    {formData.productId === "OTHER" && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name (Manual) *</label>
                        <input {...register("productName")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" placeholder="Enter product name manually" />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Linked Brand *</label>
                      <input
                        {...register("brandName", {
                          onChange: (e) => {
                            if (formData.productId && formData.productId !== "OTHER") {
                              setValue("productId", "OTHER");
                            }
                          },
                        })}
                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900"
                        placeholder="e.g. Acme Corp"
                      />
                      {errors.brandName && <p className="text-red-500 text-xs mt-1">{errors.brandName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Variant/Model (Optional)</label>
                      <input {...register("productVariant")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" placeholder="e.g. Black, 64GB" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Purchase Date *</label>
                      <input type="date" {...register("purchaseDate")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" />
                      {errors.purchaseDate && <p className="text-red-500 text-xs mt-1">{errors.purchaseDate.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Purchase Location *</label>
                      <input {...register("purchaseLocation")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" placeholder="e.g. Amazon, Local Store, Chemist" />
                      {errors.purchaseLocation && <p className="text-red-500 text-xs mt-1">{errors.purchaseLocation.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Purchase City (Optional)</label>
                      <input {...register("purchaseCity")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" placeholder="e.g. Mumbai" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Purchase State (Optional)</label>
                      <input {...register("purchaseState")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" placeholder="e.g. Maharashtra" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Purchase Country (Optional)</label>
                      <input {...register("purchaseCountry")} defaultValue="India" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" placeholder="India" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Product Price ($) *</label>
                      <input type="number" step="0.01" {...register("productPrice")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" placeholder="0.00" />
                      {errors.productPrice && <p className="text-red-500 text-xs mt-1">{errors.productPrice.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Batch/Lot Number (Optional)</label>
                      <input {...register("batchNumber")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" placeholder="Usually found near barcode" />
                    </div>
                  </div>

                  {/* ── Other Customer Complaints ── */}
                  {formData.productId && formData.productId !== "OTHER" && (
                    <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-sm">Other Customer Complaints</h3>
                        <span className="text-xs text-slate-500">For the same product only</span>
                      </div>

                      {complaintsLoading ? (
                        <div className="px-5 py-6 text-center text-sm text-slate-400">
                          Loading previous complaints…
                        </div>
                      ) : productComplaints.length === 0 ? (
                        <div className="px-5 py-6 text-center text-sm text-slate-400">
                          No previous customer complaints for this product.
                        </div>
                      ) : (
                        <ul className="divide-y divide-slate-100">
                          {productComplaints.map((c: any) => (
                            <li key={c.id} className="px-5 py-4">
                              <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-500 mb-0.5">
                                    {c.displayName || "Consumer"}
                                  </p>
                                  <p className="text-sm font-bold text-slate-800 truncate">{c.title}</p>
                                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{c.description}</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {c.issueCategory && (
                                      <span className="inline-block bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-full border border-slate-200">
                                        {c.issueCategory}
                                      </span>
                                    )}
                                    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                      c.status === "RESOLVED" || c.status === "CLOSED"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : c.status === "IN_PROGRESS" || c.status === "ACKNOWLEDGED"
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}>
                                      {c.status.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 mt-1">
                                  {new Date(c.createdAt).toLocaleDateString("en-IN")}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Complaint Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-8">Complaint Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Issue Category *</label>
                      <select {...register("issueCategory")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none appearance-none text-slate-900">
                        <option value="">Select Issue Category</option>
                        <option value="Defect">Defect</option>
                        <option value="Safety Hazard">Safety Hazard</option>
                        <option value="Billing / Charges">Billing / Charges</option>
                        <option value="Delivery">Delivery</option>
                        <option value="Customer Service">Customer Service</option>
                        <option value="Misleading Advertising">Misleading Advertising</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.issueCategory && <p className="text-red-500 text-xs mt-1">{errors.issueCategory.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Incident Date *</label>
                      <input type="date" {...register("incidentDate")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" />
                      {errors.incidentDate && <p className="text-red-500 text-xs mt-1">{errors.incidentDate.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Complaint Title *</label>
                      <input {...register("title")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" placeholder="Brief summary of the issue" />
                      {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Detailed Description *</label>
                      <textarea {...register("description")} rows={4} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none resize-none text-slate-900" placeholder="Please provide all relevant details about what happened..."></textarea>
                      {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">What Exactly Happened? *</label>
                      <textarea {...register("whatHappened")} rows={2} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none resize-none text-slate-900" placeholder="Describe the specific incident or failure..."></textarea>
                      {errors.whatHappened && <p className="text-red-500 text-xs mt-1">{errors.whatHappened.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Severity *</label>
                      <select {...register("severity")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none appearance-none text-slate-900">
                        <option value="">Select Severity</option>
                        <option value="Low">Low - Minor inconvenience</option>
                        <option value="Medium">Medium - Product unusable</option>
                        <option value="High">High - Financial loss or damage</option>
                        <option value="Critical">Critical - Safety/Health risk</option>
                      </select>
                      {errors.severity && <p className="text-red-500 text-xs mt-1">{errors.severity.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Resolution *</label>
                      <select {...register("expectedResolution")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none appearance-none text-slate-900">
                        <option value="">Select Expected Resolution</option>
                        <option value="Refund">Full Refund</option>
                        <option value="Replacement">Product Replacement</option>
                        <option value="Repair">Free Repair</option>
                        <option value="Apology">Apology & Explanation</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.expectedResolution && <p className="text-red-500 text-xs mt-1">{errors.expectedResolution.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Evidence */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-8">Supporting Evidence</h2>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                    <p className="text-sm text-blue-800">
                      Providing clear photos of the product, defect, and purchase receipt significantly speeds up the verification process.
                    </p>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                    <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*,.pdf" />
                    <Upload className="h-10 w-10 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Click or drag files to upload</h3>
                    <p className="text-slate-500 text-sm">PNG, JPG, PDF up to 5MB</p>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-8 space-y-3">
                      <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wider mb-4">Uploaded Files</h4>
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="bg-slate-100 p-2 rounded-lg">
                              <FileImage className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{file.name}</p>
                              <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeFile(idx)} className="text-red-500 text-sm font-medium hover:text-red-700">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Consumer Details */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-8">Your Contact Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                      <input {...register("consumerName")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" placeholder="John Doe" />
                      {errors.consumerName && <p className="text-red-500 text-xs mt-1">{errors.consumerName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                      <input type="email" {...register("consumerEmail")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" placeholder="john@domain.com" />
                      {errors.consumerEmail && <p className="text-red-500 text-xs mt-1">{errors.consumerEmail.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number *</label>
                      <input {...register("consumerMobile")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" placeholder="+1 (555) 000-0000" />
                      {errors.consumerMobile && <p className="text-red-500 text-xs mt-1">{errors.consumerMobile.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">City *</label>
                      <input {...register("consumerCity")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" placeholder="e.g. New York" />
                      {errors.consumerCity && <p className="text-red-500 text-xs mt-1">{errors.consumerCity.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">State/Region *</label>
                      <input {...register("consumerState")} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 bg-slate-50 border outline-none text-slate-900" placeholder="e.g. NY" />
                      {errors.consumerState && <p className="text-red-500 text-xs mt-1">{errors.consumerState.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">Review & Submit</h2>
                  
                  <div className="space-y-6">
                    {/* Section 1 */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900 text-lg">Product Information</h3>
                        <button type="button" onClick={() => setCurrentStep(1)} className="text-blue-600 font-medium text-sm hover:underline">Edit</button>
                      </div>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div>
                          <p className="text-slate-500">Product</p>
                          <p className="font-semibold text-slate-900">{formData.productName || "-"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Brand</p>
                          <p className="font-semibold text-slate-900">{formData.brandName || "-"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Product Category</p>
                          <p className="font-semibold text-slate-900">
                            {formData.productCategory || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Purchase Date</p>
                          <p className="font-semibold text-slate-900">{formData.purchaseDate || "-"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Section 2 */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900 text-lg">Complaint Details</h3>
                        <button type="button" onClick={() => setCurrentStep(2)} className="text-blue-600 font-medium text-sm hover:underline">Edit</button>
                      </div>
                      <div className="space-y-4 text-sm">
                        <div>
                          <p className="text-slate-500">Title</p>
                          <p className="font-semibold text-slate-900">{formData.title || "-"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Type & Severity</p>
                          <p className="font-semibold text-slate-900">{formData.issueCategory} • {formData.severity}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Description</p>
                          <p className="font-medium text-slate-800 bg-white p-3 rounded-lg border border-slate-200 mt-1">{formData.description || "-"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Section 3 */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900 text-lg">Contact Details</h3>
                        <button type="button" onClick={() => setCurrentStep(4)} className="text-blue-600 font-medium text-sm hover:underline">Edit</button>
                      </div>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                        <div>
                          <p className="text-slate-500">Name</p>
                          <p className="font-semibold text-slate-900">{formData.consumerName || "-"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Email</p>
                          <p className="font-semibold text-slate-900">{formData.consumerEmail || "-"}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Mobile</p>
                          <p className="font-semibold text-slate-900">{formData.consumerMobile || "-"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Consent */}
                    <div className="pt-4 border-t border-slate-200">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" {...register("consent")} className="mt-1 w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                        <span className="text-sm text-slate-600 leading-relaxed">
                          I declare that the information provided is true and accurate to the best of my knowledge. I consent to TrustPortal sharing these details with the verified brand representatives for resolution purposes.
                        </span>
                      </label>
                      {errors.consent && <p className="text-red-500 text-xs mt-2 ml-8">{errors.consent.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Error */}
              {submitError && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              {/* Bottom Navigation */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1 || isSubmitting}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}
                >
                  <ArrowLeft className="h-5 w-5" /> Back
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-blue-700 hover:bg-blue-800 transition-all shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                  >
                    Continue <ArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Complaint <ShieldCheck className="h-5 w-5" />
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubmitComplaintPage() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-50 p-12 text-center text-slate-500">Loading complaint form...</div>}><SubmitComplaintPageContent /></Suspense>;
}
