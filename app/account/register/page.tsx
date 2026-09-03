"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { customerRegister } from "@/app/actions/customer";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await customerRegister(formData);
    
    if (res.success) {
      window.location.href = res.redirect || "/account";
    } else {
      setError(res.error || "Failed to create account");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center bg-[#FAF7F2]">
      <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-xl shadow-sm border border-[#E5E5E5]">
        <h1 className="font-serif text-3xl mb-2 text-center" style={{ color: "var(--charcoal)" }}>Create Account</h1>
        <p className="text-center text-sm text-gray-500 mb-8 font-sans">Join the Eshara Naturals community</p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-sans mb-1.5 text-gray-700">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full p-3 border rounded-md font-sans text-sm outline-none focus:ring-1 bg-gray-50/50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-sans mb-1.5 text-gray-700">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full p-3 border rounded-md font-sans text-sm outline-none focus:ring-1 bg-gray-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-sans mb-1.5 text-gray-700">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border rounded-md font-sans text-sm outline-none focus:ring-1 bg-gray-50/50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-sans mb-1.5 text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border rounded-md font-sans text-sm outline-none focus:ring-1 bg-gray-50/50"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-sans rounded-md text-white transition-opacity hover:opacity-90 disabled:opacity-70 mt-4"
            style={{ background: "var(--charcoal)" }}
          >
            {loading ? "Creating..." : "Create Account"} <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 font-sans">
          Already have an account?{" "}
          <Link href="/account/login" className="text-black underline font-medium hover:text-gray-700">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
