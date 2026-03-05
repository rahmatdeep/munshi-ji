/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { API_URL } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setError("");

    try {
      await axios.post(`${API_URL}/api/auth/request-magic-link`, {
        email,
      });
      setStatus("success");
    } catch (err: any) {
      console.error("Magic link error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to send magic link. Please try again.",
      );
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-(--background) flex flex-col justify-center items-center p-4 selection:bg-(--muted) selection:text-(--foreground) relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-(--muted) blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-(--secondary) blur-3xl opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="font-serif-logo text-4xl md:text-5xl font-bold tracking-tight text-(--foreground)">
                JAPSEHAJ SINGH
              </h1>
              <div className="h-0.5 w-12 bg-(--secondary) mx-auto mt-4 rounded-full opacity-50"></div>
            </motion.div>

            <h2 className="text-xl font-medium text-(--foreground) tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-(--muted-fg)">
              Enter your email to receive a secure magic link. No passwords
              needed.
            </p>
          </div>

          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-(--muted)/30 border border-(--muted) rounded-full flex items-center justify-center mx-auto text-(--secondary) text-2xl font-bold">
                ✓
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-(--foreground)">
                  Check your email
                </h3>
                <p className="text-sm text-(--muted-fg) pb-4">
                  We sent a magic link to <br />
                  <span className="font-medium text-(--foreground)">
                    {email}
                  </span>
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-sm text-(--secondary) hover:text-(--foreground) font-medium transition-colors"
                >
                  Try a different email
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-(--foreground) block text-left"
                >
                  Email address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--secondary) group-focus-within:text-(--primary) transition-colors" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-white/60 border border-(--color-tan-500)/60 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:bg-white focus:border-(--primary) focus:ring-4 focus:ring-(--primary)/15 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-(--primary-fg) bg-(--primary) hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-(--primary)/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {status === "loading" ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-(--primary-fg)/30 border-t-(--primary-fg) rounded-full"
                  />
                ) : (
                  <>
                    Send Magic Link
                    <span className="ml-2 font-serif-logo text-lg leading-none">
                      →
                    </span>
                  </>
                )}
              </button>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 text-center font-medium"
                >
                  {error}
                </motion.p>
              )}
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-(--muted-fg)">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
