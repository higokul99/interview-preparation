import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden">
      
      {/* Decorative background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="z-10 w-full max-w-5xl flex flex-col items-center text-center gap-8">
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-6 py-2 rounded-full border border-slate-200 shadow-sm text-slate-800">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
          <span className="font-medium">Welcome to MetoStore</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-900 tracking-tight">
          Launch your store in <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">seconds.</span>
        </h1>
        
        <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
          The ultra-lightweight platform for small business owners to create a storefront, add products, and receive orders instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
          <Link href="/admin/login" className="flex items-center justify-center gap-2 px-8 py-4 text-white font-semibold rounded-2xl bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group w-full sm:w-auto">
            <span>Store Owner Portal</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/demo-store" className="flex items-center justify-center gap-2 px-8 py-4 text-slate-700 font-semibold rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto">
            View Example Storefront
          </Link>
        </div>
      </div>
    </main>
  );
}
