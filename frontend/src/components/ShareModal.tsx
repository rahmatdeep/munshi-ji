import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mail, CheckCircle, AlertCircle, Users } from "lucide-react";
import axios from "axios";
import { API_URL } from "../lib/api";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  caseId,
}: ShareModalProps) {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      fetchUsers();
      const userJson = localStorage.getItem("user");
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          setCurrentUserId(user.userId);
        } catch (e) {
          console.error("User parse error:", e);
        }
      }
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmails.length === 0 || !caseId) return;

    setStatus("loading");
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/cases/share`,
        { caseId, recipientEmails: selectedEmails },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setSelectedEmails([]);
        onClose();
      }, 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Share error:", err);
        setError(err.response?.data?.error || "Failed to share case");
      } else {
        setError("An unexpected error occurred");
      }
      setStatus("error");
    }
  };

  const toggleUser = (email: string) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter((e) => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUserId && // Filter out current user
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleManualAdd = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.includes("@")) {
      e.preventDefault();
      // Also prevent adding yourself manually if you type your own email
      const myEmail = users.find((u) => u.id === currentUserId)?.email;
      if (searchQuery !== myEmail && !selectedEmails.includes(searchQuery)) {
        setSelectedEmails([...selectedEmails, searchQuery]);
      }
      setSearchQuery("");
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
            className="w-full max-w-lg bg-[#ECE7D1] rounded-4xl shadow-2xl border border-(--color-tan)/30"
          >
            <div className="flex justify-between items-center p-6 border-b border-(--color-tan)/20 bg-white/40">
              <h3 className="text-xl font-serif-logo font-bold text-(--foreground) flex items-center gap-2">
                <Mail className="w-5 h-5 text-(--color-sage)" /> Collaborative
                Share
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-(--color-tan)/20 text-(--color-sage) transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 bg-white/20">
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-100/50 rounded-full flex items-center justify-center mb-6 text-green-600 border border-green-200 shadow-lg shadow-green-500/10"
                  >
                    <CheckCircle className="w-10 h-10" />
                  </motion.div>
                  <h4 className="text-2xl font-serif-logo font-bold text-(--foreground)">
                    Access Granted
                  </h4>
                  <p className="text-sm text-(--color-sage) mt-2 max-w-xs font-medium font-sans">
                    The selected colleagues will receive an invitation to join
                    the collaboration board shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleShare} className="space-y-6">
                  <p className="text-sm text-(--color-sage) leading-relaxed mb-6 font-medium font-sans">
                    Invite colleagues to this case to enable shared timelines,
                    collaborative insights, and team strategy.
                  </p>

                  {status === "error" && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-100 mb-4 transition-all animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="font-semibold">{error}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-xs font-black text-(--foreground) uppercase tracking-[0.15em] flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" /> Select Team Members
                    </label>

                    <div className="relative">
                      <div className="min-h-14 w-full bg-white/60 border-2 border-(--color-tan)/50 rounded-2xl p-2 flex flex-wrap gap-2 focus-within:border-(--primary) focus-within:ring-8 focus-within:ring-(--primary)/5 transition-all">
                        {selectedEmails.map((email) => (
                          <div
                            key={email}
                            className="flex items-center gap-1.5 bg-(--primary) text-white pl-3 pr-1.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-(--primary)/20 animate-in zoom-in-95"
                          >
                            {email}
                            <button
                              type="button"
                              onClick={() => toggleUser(email)}
                              className="p-0.5 hover:bg-white/20 rounded-lg"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <input
                          type="text"
                          className="flex-1 bg-transparent border-none outline-none py-2 px-2 text-sm font-semibold placeholder:font-normal placeholder:text-(--color-sage)/50 min-w-40 font-sans"
                          placeholder={
                            selectedEmails.length === 0
                              ? "Search names or type email..."
                              : ""
                          }
                          value={searchQuery}
                          onFocus={() => setIsDropdownOpen(true)}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={handleManualAdd}
                        />
                      </div>

                      <AnimatePresence>
                        {isDropdownOpen &&
                          (searchQuery || users.length > 0) && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-(--color-tan)/30 max-h-60 overflow-y-auto z-60 custom-scrollbar"
                            >
                              <div className="p-2">
                                {isLoadingUsers ? (
                                  <div className="p-4 text-center text-xs text-(--color-sage) font-bold animate-pulse">
                                    Accessing Directory...
                                  </div>
                                ) : filteredUsers.length === 0 ? (
                                  <div className="p-4 text-center text-xs text-(--color-sage) font-medium">
                                    {searchQuery.includes("@") ? (
                                      <div className="flex flex-col gap-2">
                                        <span>
                                          Press Enter to invite external:
                                        </span>
                                        <span className="text-(--primary) font-bold">
                                          {searchQuery}
                                        </span>
                                      </div>
                                    ) : (
                                      "No colleagues found"
                                    )}
                                  </div>
                                ) : (
                                  filteredUsers.map((user) => (
                                    <button
                                      key={user.id}
                                      type="button"
                                      onClick={() => {
                                        toggleUser(user.email);
                                        setSearchQuery("");
                                      }}
                                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedEmails.includes(user.email) ? "bg-(--primary)/5" : "hover:bg-(--color-tan)/10"}`}
                                    >
                                      <div className="flex flex-col items-start">
                                        <span className="text-sm font-bold text-(--foreground)">
                                          {user.name || "Unnamed Legal Clerk"}
                                        </span>
                                        <span className="text-xs text-(--color-sage)">
                                          {user.email}
                                        </span>
                                      </div>
                                      {selectedEmails.includes(user.email) && (
                                        <CheckCircle className="w-5 h-5 text-(--primary)" />
                                      )}
                                    </button>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {isDropdownOpen && (
                    <div
                      className="fixed inset-0 z-50"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                  )}

                  <button
                    type="submit"
                    disabled={
                      status === "loading" || selectedEmails.length === 0
                    }
                    className="w-full flex justify-center items-center gap-3 py-4 px-8 rounded-2xl shadow-xl shadow-(--primary)/20 text-sm font-black text-white bg-(--primary) hover:bg-[#726242] focus:outline-none focus:ring-8 focus:ring-(--primary)/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-8 active:scale-[0.98] uppercase tracking-widest"
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
                        <Send className="w-4 h-4 translate-x-0.5 -translate-y-0.5" />{" "}
                        Release Invitation
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
