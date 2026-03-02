/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_URL } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  ArrowLeft,
  Mail,
  User,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"USER" | "ADMIN">("USER");
  const [actionStatus, setActionStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
      setStatus("success");
    } catch (err: any) {
      console.error("Fetch users error:", err);
      setError(err.response?.data?.error || "Failed to load users");
      setStatus("error");
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUsers();
    };
    init();
  }, []);

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionStatus("submitting");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/auth/register`,
        {
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setActionStatus("success");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserRole("USER");
      setIsAddingUser(false);
      fetchUsers();

      setTimeout(() => setActionStatus("idle"), 3000);
    } catch (err: any) {
      console.error("Register error:", err);
      setActionStatus("error");
      setError(err.response?.data?.error || "Failed to register user");
    }
  };

  return (
    <div className="min-h-screen bg-[#ECE7D1] flex flex-col selection:bg-(--color-tan) selection:text-(--foreground) relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-(--color-tan) blur-3xl opacity-60 mix-blend-multiply" />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-(--color-sage) blur-3xl opacity-30 mix-blend-multiply" />
      </div>

      {/* Header */}
      <header className="px-6 md:px-12 py-5 flex justify-between items-center relative z-20 w-full backdrop-blur-md border-b border-(--color-tan)/40 bg-white/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-(--primary) to-[#6B5A3A] text-(--primary-fg) flex items-center justify-center font-serif-logo font-bold text-2xl shadow-xl shadow-(--primary)/20 border border-(--primary)/30">
            M
          </div>
          <div>
            <h1 className="font-serif-logo text-2xl md:text-3xl font-bold tracking-tight text-(--foreground) leading-none mb-1">
              MUNSHI JI
            </h1>
            <p className="text-[10px] md:text-xs text-(--color-sage) font-bold tracking-[0.2em] uppercase">
              Admin Console
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm font-semibold text-(--primary) transition-all px-4 py-2 rounded-full hover:bg-(--primary)/10 border border-transparent hover:border-(--primary)/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-serif-logo font-bold text-(--foreground) tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-(--primary)" />
              User Management
            </h2>
            <p className="text-sm font-medium text-(--color-sage) mt-1">
              View and manage access for legal professionals.
            </p>
          </div>
          <button
            onClick={() => setIsAddingUser(true)}
            className="flex items-center gap-2 py-3 px-6 rounded-xl shadow-lg shadow-(--primary)/20 text-sm font-bold text-(--primary-fg) bg-(--primary) hover:bg-[#726242] transition-all active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            Register New User
          </button>
        </div>

        <AnimatePresence mode="wait">
          {status === "loading" ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-12 h-12 text-(--primary) animate-spin mb-4" />
              <p className="text-(--color-sage) font-medium">
                Loading user database...
              </p>
            </motion.div>
          ) : status === "error" ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-3xl p-10 bg-red-50/80 border-red-200/50 text-center max-w-md mx-auto"
            >
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-900 mb-2">
                Access Error
              </h3>
              <p className="text-sm text-red-700 mb-6">{error}</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2 bg-white border border-red-200 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                Return to Dashboard
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6"
            >
              {isAddingUser && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card rounded-3xl overflow-hidden border-white/50 bg-white/40 mb-4"
                >
                  <form onSubmit={handleRegisterUser} className="p-6 md:p-8">
                    <h3 className="text-lg font-bold text-(--foreground) mb-6 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-(--primary)" />
                      Create New Account
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-(--foreground) uppercase tracking-wider block">
                          FullName
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-sage)" />
                          <input
                            type="text"
                            required
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="e.g. Adv. John Doe"
                            className="w-full bg-white/50 border-2 border-(--color-tan)/50 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:border-(--color-brown) focus:ring-4 focus:ring-(--color-brown)/10 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-(--foreground) uppercase tracking-wider block">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-sage)" />
                          <input
                            type="email"
                            required
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full bg-white/50 border-2 border-(--color-tan)/50 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:border-(--color-brown) focus:ring-4 focus:ring-(--color-brown)/10 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-(--foreground) uppercase tracking-wider block">
                          Access Level
                        </label>
                        <div className="relative">
                          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--color-sage)" />
                          <select
                            value={newUserRole}
                            onChange={(e) =>
                              setNewUserRole(e.target.value as any)
                            }
                            className="w-full bg-white/50 border-2 border-(--color-tan)/50 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:border-(--color-brown) transition-all appearance-none cursor-pointer"
                          >
                            <option value="USER">Standard User</option>
                            <option value="ADMIN">Administrator</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsAddingUser(false)}
                        className="px-6 py-3 rounded-xl text-sm font-bold text-(--color-sage) hover:bg-black/5 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionStatus === "submitting"}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-(--primary) text-(--primary-fg) text-sm font-bold shadow-lg shadow-(--primary)/20 hover:bg-[#726242] disabled:opacity-70 transition-all"
                      >
                        {actionStatus === "submitting" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Create User"
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              <div className="glass-card rounded-3xl overflow-hidden border-white/50 bg-white/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/40 border-b border-(--color-tan)/30">
                        <th className="px-8 py-5 text-xs font-bold text-(--color-sage) uppercase tracking-widest">
                          User Details
                        </th>
                        <th className="px-8 py-5 text-xs font-bold text-(--color-sage) uppercase tracking-widest">
                          Role
                        </th>
                        <th className="px-8 py-5 text-xs font-bold text-(--color-sage) uppercase tracking-widest">
                          Registered
                        </th>
                        <th className="px-8 py-5 text-xs font-bold text-(--color-sage) uppercase tracking-widest text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--color-tan)/20">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-white/20 transition-colors group"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-linear-to-br from-(--color-tan) to-(--color-sage)/30 flex items-center justify-center text-(--primary) font-bold">
                                {user.name?.[0] || user.email[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-(--foreground)">
                                  {user.name || "Unnamed User"}
                                </p>
                                <p className="text-xs text-(--color-sage) flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                                user.role === "ADMIN"
                                  ? "bg-amber-100/50 text-amber-700 border-amber-200"
                                  : "bg-blue-100/50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-sm text-(--color-sage) font-medium">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button
                              className="p-2 rounded-lg text-red-600/30 hover:text-red-600 hover:bg-red-50 transition-all"
                              title="Delete user (Coming soon)"
                              disabled
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Action Notifications */}
      <AnimatePresence>
        {actionStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl bg-green-600 text-white shadow-2xl shadow-green-600/20"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-sm">
              User registered successfully!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
