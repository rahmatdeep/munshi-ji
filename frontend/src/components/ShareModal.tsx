import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mail, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  caseId,
}: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !caseId) return;

    setStatus("loading");
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/cases/share",
        { caseId, recipientEmail: email },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setEmail("");
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error("Share error:", err);
      setError(err.response?.data?.error || "Failed to share case");
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-[#ECE7D1] rounded-3xl shadow-2xl overflow-hidden border border-(--color-tan)/30"
          >
            <div className="flex justify-between items-center p-6 border-b border-(--color-tan)/20 bg-white/40">
              <h3 className="text-xl font-serif-logo font-bold text-(--foreground) flex items-center gap-2">
                <Mail className="w-5 h-5 text-(--color-sage)" /> Share Case
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-(--color-tan)/20 text-(--color-sage) transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-white/20">
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-100/50 rounded-full flex items-center justify-center mb-4 text-green-600 border border-green-200"
                  >
                    <CheckCircle className="w-8 h-8" />
                  </motion.div>
                  <h4 className="text-lg font-bold text-(--foreground)">
                    Case Shared!
                  </h4>
                  <p className="text-sm text-(--color-sage) mt-1">
                    An invitation has been sent to {email}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleShare} className="space-y-4">
                  <p className="text-sm text-(--color-sage) leading-relaxed mb-4 font-medium">
                    Send an email invitation to a colleague or client to view
                    this case details and collaborate.
                  </p>

                  {status === "error" && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-xs font-bold text-(--foreground) uppercase tracking-wider"
                    >
                      Recipient Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className="w-full bg-white/60 border-2 border-(--color-tan)/50 rounded-xl px-4 py-3 text-sm font-semibold text-(--foreground) outline-none focus:border-(--color-brown) focus:ring-4 focus:ring-(--color-brown)/10 transition-all placeholder:font-normal placeholder:text-(--color-tan)"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full flex justify-center items-center gap-2 py-3 px-6 rounded-xl shadow-lg shadow-(--primary)/20 text-sm font-bold text-white bg-(--primary) hover:bg-[#726242] focus:outline-none focus:ring-4 focus:ring-(--primary)/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-6 active:scale-[0.98]"
                  >
                    {status === "loading" ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Invite
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
