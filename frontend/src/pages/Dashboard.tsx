/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_URL } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LogOut,
  Calendar,
  Hash,
  CheckCircle,
  Briefcase,
  Trash2,
  ChevronRight,
  Users,
} from "lucide-react";
import { useConfirm } from "../hooks/useConfirm";

export default function Dashboard() {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "empty"
  >("loading");
  const [error, setError] = useState("");
  const [savedCases, setSavedCases] = useState<any[]>([]);
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [currentUser] = useState<any>(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        console.error("Dashboard user parse error:", e);
      }
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const fetchSavedCases = async () => {
    setStatus("loading");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/cases/saved`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const cases = response.data.savedCases || [];
      setSavedCases(cases);
      setStatus(cases.length > 0 ? "success" : "empty");
    } catch (err: any) {
      console.error("Fetch saved cases error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to fetch saved cases. Please try again.",
      );
      setStatus("error");
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchSavedCases();
    };
    init();
  }, []);

  const handleUnsave = async (caseId: string) => {
    const confirmed = await confirm({
      title: "Remove Case",
      message: "Are you sure you want to remove this case from your dashboard?",
      confirmLabel: "Remove Case",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/cases/unsave`,
        { caseId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Remove the case from the local state
      setSavedCases((prev) => prev.filter((c) => c.id !== caseId));
      if (savedCases.length <= 1) {
        setStatus("empty");
      }
    } catch (err: any) {
      console.error("Unsave error:", err);
      alert(err.response?.data?.error || "Failed to unsave case.");
    }
  };

  return (
    <div className="min-h-screen bg-(--background) flex flex-col selection:bg-(--muted) selection:text-(--foreground) relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-(--muted) blur-3xl opacity-60 mix-blend-multiply" />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-(--secondary) blur-3xl opacity-30 mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-(--muted-bg) blur-3xl opacity-70" />
      </div>

      {/* Header */}
      <header className="px-6 md:px-12 py-5 flex justify-between items-center relative z-20 w-full backdrop-blur-md border-b border-(--muted)/40 bg-white/20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-(--primary) to-(--primary-hover) text-(--primary-fg) flex items-center justify-center font-serif-logo font-bold text-2xl shadow-xl shadow-(--primary)/20 border border-(--primary)/30">
            M
          </div>
          <div>
            <h1 className="font-serif-logo text-2xl md:text-3xl font-bold tracking-tight text-(--foreground) leading-none mb-1">
              MUNSHI JI
            </h1>
            <p className="text-[10px] md:text-xs text-(--secondary) font-bold tracking-[0.2em] uppercase">
              Legal Office
            </p>
          </div>
        </motion.div>

        <div className="flex items-center gap-4">
          <AnimatePresence>
            {currentUser?.role === "ADMIN" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key="admin-users"
              >
                <button
                  onClick={() => navigate("/admin/users")}
                  className="flex items-center gap-2 text-sm font-semibold text-amber-600 transition-all px-4 py-2 rounded-full hover:bg-amber-50 border border-transparent hover:border-amber-200"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Manage Users</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              onClick={() => navigate("/search")}
              className="flex items-center gap-2 text-sm font-semibold text-(--primary) transition-all px-4 py-2 rounded-full hover:bg-(--primary)/10 border border-transparent hover:border-(--primary)/30"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search New Cases</span>
            </button>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleLogout}
            className="group flex items-center gap-2 text-sm font-semibold text-(--foreground) transition-all border-2 border-(--muted) px-5 py-2.5 rounded-full hover:bg-(--muted)/30 hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="hidden sm:inline">Sign Out</span>
            <LogOut className="w-4 h-4 text-(--secondary) group-hover:text-(--foreground) transition-colors" />
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-10 relative z-10 flex flex-col justify-start gap-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-serif-logo font-bold text-(--foreground) tracking-tight mb-2">
            My Dashboard
          </h2>
          <p className="text-sm font-medium text-(--secondary) leading-relaxed">
            Manage and track your saved cases.
          </p>
        </motion.div>

        {/* Results Area */}
        <div className="flex-1 w-full relative min-h-100 flex flex-col">
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center my-auto flex flex-col items-center justify-center glass-card rounded-3xl p-12 max-w-md mx-auto"
              >
                <div className="relative mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-16 h-16 border-[3px] border-(--muted)/30 border-t-(--primary) rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-(--primary) animate-pulse" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-(--foreground) mb-1">
                  Loading Dashboard
                </h3>
                <p className="text-sm font-medium text-(--secondary)">
                  Retrieving your saved cases...
                </p>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center max-w-md mx-auto my-auto glass-card rounded-3xl p-10 bg-red-50/80 border-red-200/50"
              >
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  Failed to Load
                </h3>
                <p className="text-sm font-medium text-red-700/90 leading-relaxed bg-red-100/50 p-4 rounded-xl border border-red-200/50">
                  {error}
                </p>
                <button
                  onClick={fetchSavedCases}
                  className="mt-6 px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition"
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {status === "empty" && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center max-w-2xl mx-auto my-auto py-12 px-6"
              >
                <div className="relative mb-8 flex justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-24 h-24 rounded-3xl bg-linear-to-br from-white to-(--muted)/30 border border-white shadow-2xl shadow-(--primary)/5 flex items-center justify-center relative z-10"
                  >
                    <Briefcase className="w-10 h-10 text-(--primary)" />
                  </motion.div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-(--primary)/5 rounded-full blur-3xl" />
                </div>

                <h3 className="text-3xl font-serif-logo font-bold text-(--foreground) mb-4 tracking-tight">
                  Your Legal Command Center Awaits
                </h3>
                <p className="text-base font-medium text-(--secondary) leading-relaxed mb-10 max-w-lg mx-auto">
                  Your dashboard is currently an open brief. Start by searching
                  for active cases to track their status, collaborate with your
                  team, and organize your litigation strategy.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => navigate("/search")}
                    className="w-full sm:w-auto min-w-50 flex justify-center items-center gap-3 py-4 px-8 rounded-2xl shadow-xl shadow-(--primary)/20 text-sm font-bold text-(--primary-fg) bg-(--primary) hover:bg-(--primary-hover) hover:-translate-y-1 active:scale-[0.98] transition-all"
                  >
                    <Search className="w-5 h-5" />
                    Begin New Search
                  </button>
                  {currentUser?.role === "ADMIN" && (
                    <button
                      onClick={() => navigate("/admin/users")}
                      className="w-full sm:w-auto text-sm font-bold text-(--primary) border-2 border-(--primary)/20 py-4 px-8 rounded-2xl hover:bg-(--primary)/5 transition-all"
                    >
                      Invite Colleagues
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {status === "success" && savedCases.length > 0 && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {savedCases.map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-3xl p-6 shadow-5 flex flex-col group hover: transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4 gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest bg-(--secondary)/20 text-(--primary) border border-(--secondary)/30 self-start">
                        {c.caseType} {c.caseNo}/{c.caseYear}
                      </span>
                      <button
                        onClick={() => handleUnsave(c.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Remove from Dashboard"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mb-6 flex-1">
                      <h3 className="text-lg font-serif-logo font-bold text-(--foreground) leading-tight mb-1 line-clamp-2">
                        {c.petName || "Petitioner"}
                      </h3>
                      <p className="text-[10px] text-(--secondary) italic font-serif-logo my-1">
                        vs
                      </p>
                      <h3 className="text-lg font-serif-logo font-bold text-(--foreground) leading-tight line-clamp-2">
                        {c.resName || "Respondent"}
                      </h3>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-(--muted)/30 mt-auto">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-(--secondary) uppercase tracking-[0.2em] font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3" /> Status
                        </p>
                        <p className="text-xs font-semibold text-(--foreground)">
                          {c.status || "Unknown"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-(--secondary) uppercase tracking-[0.2em] font-bold flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" /> Next Hearing
                        </p>
                        <p className="text-xs font-semibold text-(--foreground)">
                          {c.nextListingDate
                            ? new Date(c.nextListingDate).toLocaleDateString()
                            : "TBD"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-(--secondary) uppercase tracking-[0.2em] font-bold flex items-center gap-1.5">
                          <Hash className="w-3 h-3" /> Diary No.
                        </p>
                        <p className="text-xs font-semibold text-(--foreground)">
                          {c.filingNo || "N/A"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/case/${c.id}`)}
                      className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-(--primary) border border-(--primary)/20 rounded-xl bg-(--card)/50 hover:bg-(--primary) hover:text-(--primary-fg) transition-all"
                    >
                      View Full Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
