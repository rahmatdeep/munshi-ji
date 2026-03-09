/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_URL } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Mail,
  User,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  IdCard,
} from "lucide-react";
import Dropdown from "../components/ui/Dropdown";
import { formatDate } from "../lib/date";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  lawyerId: string;
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
  const [newUserLawyerId, setNewUserLawyerId] = useState("");
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
          lawyerId: newUserLawyerId,
          role: newUserRole,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setActionStatus("success");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserLawyerId("");
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
    <>
      <div className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-serif-logo font-bold text-(--foreground) tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-(--primary)" />
              User Management
            </h2>
            <p className="text-sm font-medium text-(--secondary) mt-1">
              View and manage access for legal professionals.
            </p>
          </div>
          <button
            onClick={() => setIsAddingUser(true)}
            className="flex items-center gap-2 py-3 px-6 rounded-xl shadow-lg shadow-(--primary)/20 text-sm font-bold text-(--primary-fg) bg-(--primary) hover:bg-(--primary-hover) transition-all active:scale-[0.98]"
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
              <p className="text-(--secondary) font-medium">
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
                  className="glass-card rounded-3xl overflow-hidden mb-4"
                >
                  <form onSubmit={handleRegisterUser} className="p-6 md:p-8">
                    <h3 className="text-lg font-bold text-(--foreground) mb-6 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-(--primary)" />
                      Create New Account
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-(--foreground) uppercase tracking-wider block">
                          FullName
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--secondary)" />
                          <input
                            type="text"
                            required
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="e.g. Adv. John Doe"
                            className="w-full bg-white/50 border-2 border-(--muted)/50 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:border-(--primary) focus:ring-4 focus:ring-(--primary)/10 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-(--foreground) uppercase tracking-wider block">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--secondary)" />
                          <input
                            type="email"
                            required
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full bg-white/50 border-2 border-(--muted)/50 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:border-(--primary) focus:ring-4 focus:ring-(--primary)/10 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-(--foreground) uppercase tracking-wider block">
                          Lawyer ID
                        </label>
                        <div className="relative">
                          <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--secondary)" />
                          <input
                            type="text"
                            required
                            value={newUserLawyerId}
                            onChange={(e) => setNewUserLawyerId(e.target.value)}
                            placeholder="BAR/123/2023"
                            className="w-full bg-white/50 border-2 border-(--muted)/50 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none focus:border-(--primary) focus:ring-4 focus:ring-(--primary)/10 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-(--foreground) uppercase tracking-wider block">
                          Access Level
                        </label>
                        <div className="relative">
                          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--secondary)" />
                          <Dropdown
                            options={[
                              { label: "Standard User", value: "USER" },
                              { label: "Administrator", value: "ADMIN" },
                            ]}
                            value={newUserRole}
                            onChange={(val) =>
                              setNewUserRole(val as "USER" | "ADMIN")
                            }
                            searchable={false}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsAddingUser(false)}
                        className="px-6 py-3 rounded-xl text-sm font-bold text-(--secondary) hover:bg-black/5 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionStatus === "submitting"}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-(--primary) text-(--primary-fg) text-sm font-bold shadow-lg shadow-(--primary)/20 hover:bg-(--primary-hover) disabled:opacity-70 transition-all"
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

              <div className="glass-card rounded-3xl overflow-hidden ">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/40 border-b border-(--muted)/30">
                        <th className="px-8 py-5 text-xs font-bold text-(--secondary) uppercase tracking-widest">
                          User Details
                        </th>
                        <th className="px-8 py-5 text-xs font-bold text-(--secondary) uppercase tracking-widest">
                          Lawyer ID
                        </th>
                        <th className="px-8 py-5 text-xs font-bold text-(--secondary) uppercase tracking-widest">
                          Role
                        </th>
                        <th className="px-8 py-5 text-xs font-bold text-(--secondary) uppercase tracking-widest">
                          Registered
                        </th>
                        <th className="px-8 py-5 text-xs font-bold text-(--secondary) uppercase tracking-widest text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--muted)/20">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-white/20 transition-colors group"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-linear-to-br from-(--muted) to-(--secondary)/30 flex items-center justify-center text-(--primary) font-bold">
                                {user.name?.[0] || user.email[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-(--foreground)">
                                  {user.name || "Unnamed User"}
                                </p>
                                <p className="text-xs text-(--secondary) flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <code className="text-[10px] font-bold text-(--secondary) bg-(--muted)/20 px-2 py-1 rounded">
                              {user.lawyerId}
                            </code>
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
                          <td className="px-8 py-5 text-sm text-(--secondary) font-medium">
                            {formatDate(user.createdAt)}
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
      </div>

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
    </>
  );
}
