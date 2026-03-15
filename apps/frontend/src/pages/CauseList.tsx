/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_URL } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ChevronRight,
  ListOrdered,
  ArrowLeft,
  Info,
} from "lucide-react";
import { formatDate } from "../lib/date";

export default function CauseList() {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "empty"
  >("loading");
  const [error, setError] = useState("");
  const [causeList, setCauseList] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchCauseList = async () => {
    setStatus("loading");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/cases/cause-list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const list = response.data.causeList || [];
      setCauseList(list);
      setStatus(list.length > 0 ? "success" : "empty");
    } catch (err: any) {
      console.error("Fetch cause list error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to fetch cause list. Please try again.",
      );
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchCauseList();
  }, []);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-10 flex flex-col justify-start gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-xl hover:bg-(--muted)/20 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-(--secondary)" />
          </button>
          <div>
            <h2 className="text-3xl font-serif-logo font-bold text-(--foreground) tracking-tight mb-2">
              Cause List
            </h2>
            <p className="text-sm font-medium text-(--secondary) leading-relaxed">
              Cases with hearings scheduled for today and tomorrow.
            </p>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="px-4 py-2 rounded-xl bg-(--primary)/5 border border-(--primary)/10 text-(--primary) text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Today & Tomorrow
        </motion.div>
      </div>

      <div className="flex-1 w-full relative min-h-100 flex flex-col">
        <AnimatePresence mode="wait">
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 mb-6"
            >
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-blue-700 leading-relaxed">
                The cause list shows cases with hearings today and tomorrow. "Details Pending" indicates that the final court numbers or item numbers have not yet been assigned by the court system.
              </p>
            </motion.div>
          )}

          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center my-auto flex flex-col items-center justify-center glass-card rounded-3xl p-12 max-w-md mx-auto"
            >
              <div className="relative mb-6 text-(--primary)">
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
                  <ListOrdered className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-(--foreground) mb-1">
                Loading Cause List
              </h3>
              <p className="text-sm font-medium text-(--secondary)">
                Syncing upcoming hearings...
              </p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center max-w-md mx-auto my-auto glass-card rounded-3xl p-10 border-red-200/50"
            >
              <h3 className="text-xl font-bold text-red-600 mb-2">
                Failed to Load
              </h3>
              <p className="text-sm font-medium text-(--secondary) leading-relaxed bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
                {error}
              </p>
              <button
                onClick={fetchCauseList}
                className="px-6 py-2.5 bg-(--primary) text-(--primary-fg) font-semibold rounded-xl hover:bg-(--primary-hover) transition"
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
              exit={{ opacity: 0 }}
              className="text-center max-w-2xl mx-auto my-auto py-12 px-6"
            >
              <div className="relative mb-8 flex justify-center">
                <div className="w-24 h-24 rounded-3xl bg-(--muted)/20 flex items-center justify-center relative z-10">
                  <Calendar className="w-10 h-10 text-(--secondary)" />
                </div>
              </div>
              <h3 className="text-2xl font-serif-logo font-bold text-(--foreground) mb-4">
                No Upcoming Hearings
              </h3>
              <p className="text-base font-medium text-(--secondary) leading-relaxed mb-10 max-w-lg mx-auto">
                No hearings are scheduled for today or tomorrow for any of your saved cases.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-3 rounded-2xl bg-(--primary) text-(--primary-fg) font-bold text-sm hover:bg-(--primary-hover) transition-all"
              >
                Back to Dashboard
              </button>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {causeList.map((item, idx) => {
                const c = item.case;
                return (
                  <motion.div
                    key={`${c.id}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card rounded-3xl p-6 shadow-sm flex flex-col group relative overflow-hidden"
                  >
                    {item.isDetailsPending && (
                       <div className="absolute top-0 right-0 px-3 py-1 bg-yellow-100 text-yellow-700 text-[9px] font-black uppercase tracking-widest rounded-bl-xl border-b border-l border-yellow-200">
                         Details Pending
                       </div>
                    )}

                    <div className="flex items-start justify-between mb-4 gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest bg-(--secondary)/10 text-(--primary) border border-(--secondary)/20">
                        {c.caseType} {c.caseNo}/{c.caseYear}
                      </span>
                    </div>

                    <div className="mb-6 flex-1">
                      <h3 className="text-base md:text-lg font-serif-logo font-bold text-(--foreground) leading-tight mb-1 line-clamp-2">
                        {c.petName || "Petitioner"}
                      </h3>
                      <p className="text-[10px] text-(--secondary) italic font-serif-logo my-1">
                        vs
                      </p>
                      <h3 className="text-base md:text-lg font-serif-logo font-bold text-(--foreground) leading-tight line-clamp-2">
                        {c.resName || "Respondent"}
                      </h3>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[9px] text-(--secondary) font-bold uppercase tracking-wider">
                            Court / Item
                          </p>
                          <p className="text-xs font-bold text-(--foreground)">
                            {item.courtNo ? `Court ${item.courtNo}` : "TBD"}
                            {item.srNo ? ` / Item ${item.srNo}` : " / TBD"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] text-(--secondary) font-bold uppercase tracking-wider">
                            Date
                          </p>
                          <p className="text-xs font-bold text-(--foreground)">
                            {formatDate(item.hearingDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-(--muted)/30 mt-auto flex items-center justify-between">
                       <div className="flex flex-col">
                          <p className="text-[9px] text-(--secondary) font-bold uppercase tracking-wider">
                             Bench
                          </p>
                          <p className="text-[11px] font-semibold text-(--foreground) line-clamp-1">
                             {item.benchName || "Hon'ble Bench"}
                          </p>
                       </div>
                    </div>

                    <button
                      onClick={() => navigate(`/case/${c.id}`)}
                      className="mt-4 w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-(--primary) bg-(--primary)/5 border border-(--primary)/10 rounded-xl hover:bg-(--primary) hover:text-(--primary-fg) transition-all"
                    >
                      View Case
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
