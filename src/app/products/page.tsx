"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, PackageSearch, ExternalLink } from "lucide-react";
import Image from "next/image";

type Product = { 
  id: string; 
  name: string; 
  type: string; 
  category: string; 
  modelName: string | null; 
  modelNumber: string | null; 
  imageUrl: string | null;
  brand: { name: string; slug: string; officialWebsite: string | null }; 
  _count: { complaints: number } 
};

// Map specific products to their exact official URLs if available, fallback to brand.officialWebsite
const getOfficialUrl = (product: Product) => {
  const name = product.name.toLowerCase();
  if (name.includes("lg 9kg front load")) return "https://www.lg.com/in/washing-machines";
  if (name.includes("apple airpods")) return "https://www.apple.com/in/airpods/";
  if (name.includes("apple airtag")) return "https://www.apple.com/in/airtag/";
  if (name.includes("iphone 15")) return "https://www.apple.com/in/iphone-15/";
  if (name.includes("bosch 8kg")) return "https://www.bosch-home.in/products/washers-dryers";
  if (name.includes("good day")) return "https://britannia.co.in/products/good-day";
  if (name.includes("revitalift")) return "https://www.loreal-paris.co.in/revitalift";
  if (name.includes("hyaluron")) return "https://www.loreal-paris.co.in/skin-care/hyaluron-expert";
  return product.brand.officialWebsite;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    fetch("/api/products")
      .then((response) => response.json())
      .then((data) => setProducts(Array.isArray(data) ? data : data.products || []))
      .finally(() => setLoading(false)); 
  }, []);

  const visible = products.filter((product) => 
    `${product.name} ${product.type} ${product.category} ${product.modelName || ""} ${product.modelNumber || ""} ${product.brand.name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-600">Product directory</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-gray-900">Search products and brands</h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            Find a product’s public complaint history by brand, type, category, model name, or model number. This directory is for research, not shopping.
          </p>
          <div className="relative mt-8 max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -trangray-y-1/2 text-gray-400" />
            <label htmlFor="product-search" className="sr-only">Search products</label>
            <input 
              id="product-search" 
              value={search} 
              onChange={(event) => setSearch(event.target.value)} 
              placeholder="Search brand, product, model..." 
              className="w-full rounded-xl border border-gray-300 bg-white py-4 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" 
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <p className="py-20 text-center text-gray-500">Loading products...</p>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <PackageSearch className="mx-auto h-10 w-10 text-gray-400" />
            <h2 className="mt-4 font-bold text-gray-900">No matching products</h2>
            <p className="mt-2 text-sm text-gray-500">Try a different search or file a complaint to add a product.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => {
              const officialUrl = getOfficialUrl(product);
              
              return (
                <div key={product.id} className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:border-teal-300 hover:shadow-md overflow-hidden transition-all">
                  {/* Product Image Section */}
                  {product.imageUrl ? (
                    <div className="relative w-full h-48 bg-white border-b border-gray-100 p-4 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={product.imageUrl} 
                        alt={`${product.brand.name} ${product.name}`} 
                        className="max-w-full max-h-full object-contain mix-blend-multiply text-gray-500 text-xs font-medium text-center"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-50 border-b border-gray-100 flex flex-col items-center justify-center text-gray-300">
                      <PackageSearch className="h-10 w-10 mb-2 opacity-50" />
                      <span className="text-xs uppercase tracking-wider font-semibold opacity-70">No image available</span>
                    </div>
                  )}

                  <Link href={`/products/${product.brand.slug}/${product.id}`} className="flex-1 p-5 block">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
                        {product.category}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-teal-700" />
                    </div>
                    <h2 className="mt-4 text-lg font-extrabold text-gray-900 line-clamp-2 leading-tight">{product.name}</h2>
                    <p className="mt-1.5 text-sm font-semibold text-gray-600">{product.brand.name} · {product.type}</p>
                    <p className="mt-3 text-xs text-gray-500 truncate">{product.modelNumber || product.modelName || "Model details not provided"}</p>
                    <p className="mt-4 text-xs font-bold uppercase tracking-wide text-orange-600">
                      {product._count.complaints} complaint record{product._count.complaints !== 1 && "s"}
                    </p>
                  </Link>

                  {/* Official Website Link Footer */}
                  {officialUrl && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-3 px-5">
                      <a 
                        href={officialUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Official Website <ExternalLink className="ml-1.5 h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
