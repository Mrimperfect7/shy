"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  requestPasswordResetOtp, 
  verifyPasswordResetOtpAndResetPassword 
} from "@/app/actions/customer";
import { ArrowLeft, CheckCircle2, KeyRound, Mail, Lock, ShieldCheck, Loader2 } from "lucide-react";

export default function UnifiedLogin() {
  const router = useRouter();

  const [view, setView] = useState<'login' | 'recover' | 'verify_otp' | 'recovered'>('login');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP Reset states
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      const target = data.redirect || (data.role === "ADMIN" ? "/admin" : data.role === "INFLUENCER" ? "https://influencer.esharanatural.com" : "/account");
      window.location.href = target;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccessMsg("");
    
    const res = await requestPasswordResetOtp(email);
    setLoading(false);
    
    if (res.success) {
      setSuccessMsg(res.message || "A 6-digit verification code has been sent.");
      if (res.devOtp) setOtp(res.devOtp);
      setView('verify_otp');
    } else {
      setError(res.error || "Failed to send reset code. Please check your email.");
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      setError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await verifyPasswordResetOtpAndResetPassword({
      email,
      otp: otp.trim(),
      newPassword,
    });

    setLoading(false);

    if (res.success) {
      setView('recovered');
      setTimeout(() => {
        const target = res.redirect || "/account";
        window.location.href = target;
      }, 1500);
    } else {
      setError(res.error || "Failed to reset password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-6 lg:pt-10 px-4" style={{ background: "var(--ivory)" }}>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border" style={{ borderColor: "rgba(26, 26, 26, 0.1)" }}>
        
        {view === 'login' && (
          <div className="animate-in fade-in duration-300">
            <div className="text-center mb-8">
              <Link href="/" className="font-serif text-2xl tracking-wide uppercase block mb-4" style={{ color: "var(--charcoal)" }}>
                Eshara
              </Link>
              <h1 className="font-serif text-xl" style={{ color: "var(--charcoal)" }}>Partner & Admin Portal</h1>
              <p className="text-sm text-gray-500 mt-2 font-sans">Sign in to access your dashboard</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-sans mb-1" style={{ color: "var(--text-secondary)" }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 border rounded-md font-sans text-sm outline-none focus:ring-1"
                  style={{ borderColor: "rgba(26,26,26,0.2)" }}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-sans" style={{ color: "var(--text-secondary)" }}>Password</label>
                  <button 
                    type="button" 
                    onClick={() => { setView('recover'); setError(""); setSuccessMsg(""); }}
                    className="text-xs text-gray-500 hover:text-black hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 border rounded-md font-sans text-sm outline-none focus:ring-1"
                  style={{ borderColor: "rgba(26,26,26,0.2)" }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-sm font-sans tracking-widest uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--charcoal)", color: "var(--ivory)" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        )}

        {view === 'recover' && (
          <div className="animate-in fade-in duration-300">
            <button 
              onClick={() => { setView('login'); setError(""); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors mb-5"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gray-50 text-[var(--charcoal)] rounded-full flex items-center justify-center mx-auto mb-3 border">
                <KeyRound size={22} />
              </div>
              <h1 className="font-serif text-xl" style={{ color: "var(--charcoal)" }}>Reset Password</h1>
              <p className="text-sm text-gray-500 font-sans mt-2">
                Enter your email to receive a 6-digit verification code.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleRequestOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-sans mb-1" style={{ color: "var(--text-secondary)" }}>Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border rounded-md font-sans text-sm outline-none focus:ring-1"
                    style={{ borderColor: "rgba(26,26,26,0.2)" }}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-sm font-sans tracking-widest uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--charcoal)", color: "var(--ivory)" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? "Sending Code..." : "Send Verification Code"}
              </button>
            </form>
          </div>
        )}

        {view === 'verify_otp' && (
          <div className="animate-in fade-in duration-300">
            <button 
              onClick={() => { setView('recover'); setError(""); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors mb-5"
            >
              <ArrowLeft size={14} /> Change Email
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gray-50 text-[var(--charcoal)] rounded-full flex items-center justify-center mx-auto mb-3 border">
                <ShieldCheck size={24} />
              </div>
              <h1 className="font-serif text-xl" style={{ color: "var(--charcoal)" }}>Enter Code &amp; Reset</h1>
              <p className="text-sm text-gray-500 font-sans mt-2">
                We sent a 6-digit code to <strong className="text-black">{email}</strong>
              </p>
            </div>

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-sm rounded-md border border-emerald-200">
                {successMsg}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-sans mb-1" style={{ color: "var(--text-secondary)" }}>6-Digit OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 border rounded-md font-bold outline-none focus:ring-1"
                  style={{ borderColor: "rgba(26,26,26,0.2)" }}
                  placeholder="••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-sans mb-1" style={{ color: "var(--text-secondary)" }}>New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border rounded-md font-sans text-sm outline-none focus:ring-1"
                    style={{ borderColor: "rgba(26,26,26,0.2)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-sans mb-1" style={{ color: "var(--text-secondary)" }}>Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border rounded-md font-sans text-sm outline-none focus:ring-1"
                    style={{ borderColor: "rgba(26,26,26,0.2)" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 mt-4 text-sm font-sans tracking-widest uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--charcoal)", color: "var(--ivory)" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? "Resetting Password..." : "Reset Password & Sign In"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleRequestOtpSubmit}
                  disabled={loading}
                  className="text-xs text-gray-500 hover:text-black underline font-medium"
                >
                  Didn't receive code? Resend OTP
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'recovered' && (
          <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 bg-gray-50 text-[var(--charcoal)] rounded-full flex items-center justify-center mb-4 border">
              <CheckCircle2 size={36} />
            </div>
            <h1 className="font-serif text-xl mb-2" style={{ color: "var(--charcoal)" }}>Password Updated!</h1>
            <p className="text-sm text-gray-500 font-sans">
              Your password has been reset securely. Redirecting to your dashboard...
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
