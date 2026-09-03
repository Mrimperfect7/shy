"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  customerLogin, 
  requestPasswordResetOtp, 
  verifyPasswordResetOtpAndResetPassword 
} from "@/app/actions/customer";
import { ArrowRight, ArrowLeft, CheckCircle2, KeyRound, Mail, Lock, ShieldCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  
  // View states: 'login' | 'recover' | 'verify_otp' | 'recovered'
  const [view, setView] = useState<'login' | 'recover' | 'verify_otp' | 'recovered'>('login');
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP Reset states
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await customerLogin(email, password);
    
    if (res.success) {
      toast.success("Welcome back!");
      const target = res.redirect || "/account";
      window.location.href = target;
    } else {
      setError(res.error || "Invalid email or password.");
      setLoading(false);
    }
  };

  // Step 1: Request 6-digit OTP
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
      toast.success(res.message || "OTP code sent to your email!");
      setSuccessMsg(res.message || "A 6-digit verification code has been sent.");
      if (res.devOtp) {
        setOtp(res.devOtp);
      }
      setView('verify_otp');
    } else {
      setError(res.error || "Failed to send reset code. Please check your email.");
    }
  };

  // Step 2: Verify OTP & Set New Password
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
      toast.success("Password reset successfully! Logging you in...");
      setView('recovered');
      setTimeout(() => {
        const target = res.redirect || "/account";
        window.location.href = target;
      }, 1000);
    } else {
      setError(res.error || "Failed to reset password.");
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 flex items-center justify-center bg-[#FAF7F2]">
      <div className="w-full max-w-md bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-[#EAE5DC]">
        
        {/* ── 1. LOGIN VIEW ── */}
        {view === 'login' && (
          <div className="animate-in fade-in duration-300">
            <div className="text-center mb-6">
              <h1 className="font-serif text-3xl font-bold mb-1.5" style={{ color: "var(--charcoal)" }}>Welcome Back</h1>
              <p className="text-sm text-gray-500 font-sans">Sign in to your Eshara Naturals account</p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-lg border border-red-200 text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-sans font-semibold mb-1.5 text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl font-sans text-sm outline-none focus:border-[#0A2612] focus:ring-1 focus:ring-[#0A2612] bg-gray-50/50 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs uppercase tracking-wider font-sans font-semibold text-gray-700">Password</label>
                  <button 
                    type="button" 
                    onClick={() => { setView('recover'); setError(""); setSuccessMsg(""); }}
                    className="text-xs text-[var(--forest)] hover:underline font-semibold transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl font-sans text-sm outline-none focus:border-[#0A2612] focus:ring-1 focus:ring-[#0A2612] bg-gray-50/50 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-sans font-semibold rounded-xl text-white transition-all hover:opacity-95 disabled:opacity-70 mt-2 shadow-sm"
                style={{ background: "var(--forest)" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500 font-sans">
              Don't have an account?{" "}
              <Link href="/account/register" className="text-[var(--forest)] font-bold underline hover:opacity-80">
                Create one now
              </Link>
            </div>
          </div>
        )}

        {/* ── 2. FORGOT PASSWORD (STEP 1: ENTER EMAIL) ── */}
        {view === 'recover' && (
          <div className="animate-in fade-in duration-300">
            <button 
              onClick={() => { setView('login'); setError(""); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors mb-5"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-50 text-[var(--forest)] rounded-full flex items-center justify-center mx-auto mb-3">
                <KeyRound size={22} />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1.5" style={{ color: "var(--charcoal)" }}>Reset Password</h1>
              <p className="text-xs sm:text-sm text-gray-500 font-sans">
                Enter your account email and we'll send you an instant 6-digit verification code.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-lg border border-red-200 text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleRequestOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-sans font-semibold mb-1.5 text-gray-700">Account Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl font-sans text-sm outline-none focus:border-[#0A2612] focus:ring-1 focus:ring-[#0A2612] bg-gray-50/50 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-sans font-semibold rounded-xl text-white transition-all hover:opacity-95 disabled:opacity-70 shadow-sm"
                style={{ background: "var(--forest)" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending Code...
                  </>
                ) : (
                  <>
                    Send Verification Code <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── 3. OTP & NEW PASSWORD (STEP 2) ── */}
        {view === 'verify_otp' && (
          <div className="animate-in fade-in duration-300">
            <button 
              onClick={() => { setView('recover'); setError(""); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors mb-5"
            >
              <ArrowLeft size={14} /> Change Email
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-50 text-[var(--forest)] rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={24} />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1.5" style={{ color: "var(--charcoal)" }}>Enter Code &amp; Reset</h1>
              <p className="text-xs sm:text-sm text-gray-500 font-sans">
                We sent a 6-digit code to <strong className="text-black">{email}</strong>
              </p>
            </div>

            {successMsg && (
              <div className="mb-4 p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 text-center font-medium">
                {successMsg}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-lg border border-red-200 text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-sans font-semibold mb-1.5 text-gray-700">6-Digit OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 border border-gray-300 rounded-xl font-bold outline-none focus:border-[#0A2612] focus:ring-1 focus:ring-[#0A2612] bg-emerald-50/30"
                  placeholder="••••••"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-sans font-semibold mb-1.5 text-gray-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl font-sans text-sm outline-none focus:border-[#0A2612] focus:ring-1 focus:ring-[#0A2612] bg-gray-50/50"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-sans font-semibold mb-1.5 text-gray-700">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl font-sans text-sm outline-none focus:border-[#0A2612] focus:ring-1 focus:ring-[#0A2612] bg-gray-50/50"
                    placeholder="Re-type new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-sans font-semibold rounded-xl text-white transition-all hover:opacity-95 disabled:opacity-70 shadow-sm"
                style={{ background: "var(--forest)" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password &amp; Sign In <ArrowRight size={16} />
                  </>
                )}
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

        {/* ── 4. SUCCESS VIEW ── */}
        {view === 'recovered' && (
          <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 bg-emerald-50 text-[var(--forest)] rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2" style={{ color: "var(--charcoal)" }}>Password Updated!</h1>
            <p className="text-sm text-gray-500 mb-6 font-sans">
              Your password has been reset securely. Redirecting to your account...
            </p>
            <Link
              href="/account"
              className="w-full flex items-center justify-center py-3.5 text-sm font-sans font-semibold rounded-xl text-white transition-opacity hover:opacity-90 shadow-sm"
              style={{ background: "var(--forest)" }}
            >
              Go to My Account
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
