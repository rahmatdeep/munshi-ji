/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { API_URL } from "../lib/api";

type Status = "verifying" | "success" | "error";

export default function VerifyMagicLink() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const token = searchParams.get("token");

    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setErrorMessage("No token provided. Please request a new magic link.");
        return;
      }

      try {
        const response = await axios.post(
          `${API_URL}/api/auth/verify-magic-link`,
          { token },
        );
        const { token: jwtToken, user } = response.data;

        // Store the JWT and user essentials
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("user", JSON.stringify(user));

        setStatus("success");

        // Redirect to dashboard after a brief moment
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (err: any) {
        console.error("Verification error:", err);
        setStatus("error");
        setErrorMessage(
          err.response?.data?.error ||
            "Invalid or expired magic link. Please request a new one.",
        );
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#ECE7D1] flex flex-col justify-center items-center p-4 selection:bg-(--color-tan) selection:text-(--foreground) relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-(--color-tan) blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-(--color-sage) blur-3xl opacity-40" />
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
                MUNSHI JI
              </h1>
              <div className="h-0.5 w-12 bg-(--color-sage) mx-auto mt-4 rounded-full opacity-50"></div>
            </motion.div>
          </div>

          {status === "verifying" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 border-[3px] border-(--color-tan) border-t-(--color-brown) rounded-full mx-auto"
              />
              <div className="space-y-2">
                <h2 className="text-xl font-medium text-(--foreground) tracking-tight">
                  Verifying your link
                </h2>
                <p className="text-sm text-(--muted-fg)">
                  Please wait while we sign you in...
                </p>
              </div>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-(--color-tan)/30 border border-(--color-tan) rounded-full flex items-center justify-center mx-auto text-(--color-sage) text-2xl font-bold"
              >
                ✓
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-xl font-medium text-(--foreground) tracking-tight">
                  You're signed in!
                </h2>
                <p className="text-sm text-(--muted-fg)">
                  Redirecting you momentarily...
                </p>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-100/60 border border-red-200 rounded-full flex items-center justify-center mx-auto text-red-400 text-2xl font-bold">
                ✕
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-medium text-(--foreground) tracking-tight">
                  Verification failed
                </h2>
                <p className="text-sm text-(--muted-fg)">{errorMessage}</p>
              </div>
              <button
                onClick={() => navigate("/")}
                className="mt-2 inline-flex items-center py-2.5 px-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-(--primary-fg) bg-(--primary) hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-(--primary)/20 transition-all active:scale-[0.98]"
              >
                Back to Sign In
                <span className="ml-2 font-serif-logo text-lg leading-none">
                  →
                </span>
              </button>
            </motion.div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-(--muted-fg)">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
