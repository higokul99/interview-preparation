"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Plus, Package, ShoppingCart, LogOut, Copy, ExternalLink, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Product Form
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: "", description: "", price: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storeData = await fetchAPI("/stores/me/");
      setStore(storeData);
      
      const [productsData, ordersData] = await Promise.all([
        fetchAPI(`/stores/${storeData.id}/products/`),
        fetchAPI("/orders/")
      ]);
      
      setProducts(productsData);
      setOrders(ordersData);
    } catch (error) {
      console.error(error);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchAPI("/products/", {
        method: "POST",
        body: JSON.stringify({
          title: newProduct.title,
          description: newProduct.description,
          price: parseFloat(newProduct.price)
        })
      });
      setShowProductForm(false);
      setNewProduct({ title: "", description: "", price: "" });
      loadData(); // refresh
    } catch (error) {
      console.error("Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  }

  const storefrontUrl = `http://localhost:3000/${store.id}`;
  const totalRevenue = orders.reduce((sum, order) => {
    const p = products.find(prod => prod.id === order.product_id);
    return sum + (p ? p.price : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-lg">
            {store.store_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">{store.store_name}</h1>
            <p className="text-xs text-slate-500">Admin Dashboard</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-slate-500 hover:text-slate-900 transition-colors p-2 bg-slate-100 rounded-lg hover:bg-slate-200">
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col - Stats & Links */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Storefront Link</h2>
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input type="text" readOnly value={storefrontUrl} className="bg-transparent text-sm text-slate-700 w-full outline-none" />
              <button 
                onClick={() => navigator.clipboard.writeText(storefrontUrl)}
                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                title="Copy Link"
              >
                <Copy className="w-4 h-4" />
              </button>
              <Link href={`/${store.id}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Open Store">
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-3xl text-white shadow-md">
              <ShoppingCart className="w-6 h-6 mb-4 text-blue-200" />
              <p className="text-blue-100 text-sm">Total Orders</p>
              <p className="text-3xl font-bold">{orders.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-3xl text-white shadow-md">
              <DollarSign className="w-6 h-6 mb-4 text-purple-200" />
              <p className="text-purple-100 text-sm">Revenue</p>
              <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Right Col - Products & Orders */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Products Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-slate-400" />
                Products
              </h2>
              <button 
                onClick={() => setShowProductForm(!showProductForm)}
                className="flex items-center gap-1 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {showProductForm && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Title</label>
                    <input type="text" required value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Vintage Leather Bag" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                    <input type="number" step="0.01" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="99.99" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                    <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" rows={3} placeholder="A beautiful handcrafted leather bag..."></textarea>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                    <button type="button" onClick={() => setShowProductForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-50">Save Product</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              {products.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No products added yet.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {products.map(product => (
                    <li key={product.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{product.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-1">{product.description || "No description"}</p>
                      </div>
                      <div className="font-mono font-medium text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                        ${product.price.toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Orders Section */}
          <section>
            <div className="flex items-center gap-2 mb-6 mt-12">
              <TrendingUp className="w-6 h-6 text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-900">Recent Orders</h2>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No orders yet. Start sharing your storefront!</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map(order => {
                        const product = products.find(p => p.id === order.product_id);
                        return (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-medium text-slate-900">{order.customer_name}</p>
                              <p className="text-xs text-slate-500">{order.customer_email}</p>
                            </td>
                            <td className="px-6 py-4">
                              {product ? product.title : `Product #${order.product_id}`}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 capitalize">
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
