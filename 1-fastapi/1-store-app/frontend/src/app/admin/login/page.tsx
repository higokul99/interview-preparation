"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Lock, User, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    store_name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Form URL Encoded for OAuth2
        const urlParams = new URLSearchParams();
        urlParams.append("username", formData.username);
        urlParams.append("password", formData.password);

        const response = await fetch("http://127.0.0.1:8001/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: urlParams,
        });

        if (!response.ok) {
          throw new Error("Invalid username or password");
        }

        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        router.push("/admin");
      } else {
        // Register
        await fetchAPI("/stores/", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        
        // Auto login after register
        const urlParams = new URLSearchParams();
        urlParams.append("username", formData.username);
        urlParams.append("password", formData.password);

        const response = await fetch("http://127.0.0.1:8001/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: urlParams,
        });
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
      <Link href="/" className="absolute top-8 left-8 text-slate-500 hover:text-slate-800 transition-colors">
        &larr; Back to Home
      </Link>
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? "Welcome Back" : "Create your Store"}
            </h1>
            <p className="text-slate-500">
              {isLogin 
                ? "Sign in to manage your storefront" 
                : "Get started with your free MetoStore"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.store_name}
                    onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="My Awesome Shop"
                  />
                  <ShoppingBag className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="admin"
                />
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="••••••••"
                />
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Store"}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
            >
              {isLogin 
                ? "Don't have a store yet? Sign up" 
                : "Already have a store? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
