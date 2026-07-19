import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, User, Sparkles } from "lucide-react";
import { Logo } from "../components/Logo";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, loading, login } = useAuth();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, redirect
  useEffect(() => {
    if (!loading && user) {
      navigate("/rooms", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await login(name.trim());
      navigate("/rooms", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div class="min-h-screen bg-slate-50 flex items-center justify-center">
        <div class="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div class="absolute top-0 right-0 w-96 h-96 rounded-[40%_60%_70%_30%/50%_40%_60%_50%] bg-blue-600 opacity-90 -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 rounded-[60%_40%_50%_50%/45%_55%_45%_55%] bg-amber-400 translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
      <div class="absolute bottom-16 left-48 w-16 h-16 rounded-full bg-emerald-500 pointer-events-none opacity-80"></div>
      <div class="absolute top-24 right-64 w-10 h-10 rounded-full bg-blue-300 pointer-events-none opacity-60"></div>

      <div class="w-full max-w-md space-y-8 relative z-10">
        <div class="flex justify-center">
          <Logo size="lg" />
        </div>

        <div class="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl space-y-6">
          <div class="text-center space-y-2">
            <div class="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto mb-2">
              <Sparkles size={22} />
            </div>
            <h1 class="font-display font-black text-2xl text-slate-900 tracking-tight">Welcome to linkdln.undo</h1>
            <p class="text-xs text-slate-400 font-semibold">
              Enter your display name to join the networking pad. No password needed.
            </p>
          </div>

          <form onSubmit={handleSubmit} class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Your Display Name
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  id="display-name"
                  placeholder="e.g. Hashir Muhiyudheen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  class="w-full text-sm rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3.5 font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition placeholder:text-slate-300"
                  required
                  disabled={submitting}
                  autoFocus
                  maxLength={60}
                />
              </div>
            </div>

            {error && (
              <p class="text-xs font-bold text-red-500 bg-red-50 rounded-xl px-4 py-2.5 border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              id="continue-btn"
              disabled={submitting || !name.trim()}
              class="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-4 py-4 shadow-md shadow-blue-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <div class="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Setting up your profile...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p class="text-[10px] text-center text-slate-400 font-semibold leading-relaxed">
            Each browser or device gets its own independent profile.
            No password, no email, just your name.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
