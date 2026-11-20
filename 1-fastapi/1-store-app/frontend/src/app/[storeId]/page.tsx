"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { useParams } from "next/navigation";
import { ShoppingBag, CreditCard, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Storefront() {
  const params = useParams();
  const storeId = params.storeId as string;
  
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: browse, 1: form, 2: success
  const [customer, setCustomer] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const storeData = await fetchAPI(`/stores/${storeId}`);
        setStore(storeData);
        
        const productsData = await fetchAPI(`/stores/${storeId}/products/`);
        setProducts(productsData);
      } catch (err) {
        setError("Store not found or unavailable.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [storeId]);

  const handleBuy = (product: any) => {
    setSelectedProduct(product);
    setCheckoutStep(1);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchAPI(`/stores/${storeId}/orders/`, {
        method: "POST",
        body: JSON.stringify({
          customer_name: customer.name,
          customer_email: customer.email,
          product_id: selectedProduct.id
        })
      });
      setCheckoutStep(2); // Success
    } catch (err) {
      alert("Failed to process order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading store...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Store Header */}
      <header className="bg-white border-b border-slate-200 py-8 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl flex items-center justify-center font-bold text-3xl shadow-lg">
            {store.store_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{store.store_name}</h1>
            <p className="text-slate-500">Powered by MetoStore</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 py-12">
        {checkoutStep === 0 && (
          <>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
              Latest Products
            </h2>
            
            {products.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500">
                This store doesn't have any products yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{product.title}</h3>
                      <p className="text-slate-500 mb-6 leading-relaxed line-clamp-3">{product.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-2xl font-black text-slate-900">${product.price.toFixed(2)}</span>
                      <button 
                        onClick={() => handleBuy(product)}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2 group"
                      >
                        Buy Now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {checkoutStep === 1 && selectedProduct && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-lg border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setCheckoutStep(0)} className="text-slate-500 hover:text-slate-800 mb-6 text-sm font-medium transition-colors">
              &larr; Back to Products
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Secure Checkout</h2>
            <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-200">
              <p className="font-semibold text-slate-900">{selectedProduct.title}</p>
              <p className="text-slate-500 text-sm mb-2">{selectedProduct.description}</p>
              <p className="text-xl font-black text-slate-900">${selectedProduct.price.toFixed(2)}</p>
            </div>
            
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input required type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@example.com" />
              </div>
              
              <div className="pt-4">
                <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70">
                  <CreditCard className="w-5 h-5" />
                  {submitting ? "Processing..." : `Pay $${selectedProduct.price.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        )}

        {checkoutStep === 2 && (
          <div className="max-w-md mx-auto bg-white p-12 rounded-3xl shadow-lg border border-slate-100 text-center animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h2>
            <p className="text-slate-600 mb-8">
              Thank you for your purchase, {customer.name.split(' ')[0]}. We've sent a receipt to {customer.email}.
            </p>
            <button onClick={() => { setCheckoutStep(0); setSelectedProduct(null); }} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-200 bg-white">
        Powered by <Link href="/" className="font-semibold text-slate-500 hover:text-slate-800">MetoStore Prototype</Link>
      </footer>
    </div>
  );
}
