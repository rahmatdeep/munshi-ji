/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Briefcase,
  ArrowLeft,
  Trash2,
  ShieldAlert,
  Share2,
} from "lucide-react";
import CaseView from "../components/CaseView";
import ShareModal from "../components/ShareModal";
import NotesSection from "../components/NotesSection";

export default function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState("");
  const [caseData, setCaseData] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      if (!id) return;

      setStatus("loading");
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/api/cases/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setCaseData(response.data.case);
        setStatus("success");
      } catch (err: any) {
        console.error("Fetch case details error:", err);
        setError(err.response?.data?.error || "Failed to fetch case details.");
        setStatus("error");
      }
    };

    fetchCaseDetails();
  }, [id]);

  const handleUnsave = async () => {
    if (!id) return;
    if (
      !confirm("Are you sure you want to remove this case from your dashboard?")
    )
      return;

    setIsRemoving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/cases/unsave",
        { caseId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Unsave error:", err);
      alert(
        err.response?.data?.error || "Failed to remove case from dashboard.",
      );
      setIsRemoving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECE7D1] flex flex-col selection:bg-(--color-tan) selection:text-(--foreground) relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-(--color-tan) blur-3xl opacity-60 mix-blend-multiply" />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-(--color-sage) blur-3xl opacity-30 mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-[#f4f1e5] blur-3xl opacity-70" />
      </div>

      {/* Header */}
      <header className="px-6 md:px-12 py-5 flex justify-between items-center relative z-20 w-full backdrop-blur-md border-b border-(--color-tan)/40 bg-white/20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-(--primary) to-[#6B5A3A] text-(--primary-fg) flex items-center justify-center font-serif-logo font-bold text-2xl shadow-xl shadow-(--primary)/20 border border-(--primary)/30">
            M
          </div>
          <div>
            <h1 className="font-serif-logo text-2xl md:text-3xl font-bold tracking-tight text-(--foreground) leading-none mb-1">
              MUNSHI JI
            </h1>
            <p className="text-[10px] md:text-xs text-(--color-sage) font-bold tracking-[0.2em] uppercase">
              Legal Operating System
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm font-semibold text-(--primary) transition-all px-4 py-2 rounded-full hover:bg-(--primary)/10 border border-transparent hover:border-(--primary)/30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-10 relative z-10 flex flex-col justify-start">
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center my-auto flex flex-col items-center justify-center glass-card rounded-3xl p-12 bg-white/30 border-white/50 max-w-md mx-auto mt-20"
            >
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-16 h-16 border-[3px] border-(--color-tan)/30 border-t-(--primary) rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-(--primary) animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-(--foreground) mb-1">
                Loading Case Details
              </h3>
              <p className="text-sm font-medium text-(--color-sage)">
                Retrieving full case dossier...
              </p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center max-w-md mx-auto glass-card rounded-3xl p-10 bg-red-50/80 border-red-200/50 mt-20"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-100/60 border-2 border-red-200/50 flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-2">
                Failed to Load Case
              </h3>
              <p className="text-sm font-medium text-red-700/90 leading-relaxed bg-red-100/50 p-4 rounded-xl border border-red-200/50">
                {error}
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-6 px-6 py-2.5 bg-white text-red-600 border border-red-200 font-semibold rounded-xl hover:bg-red-50 transition"
              >
                Return to Dashboard
              </button>
            </motion.div>
          )}

          {status === "success" && caseData && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <CaseView
                caseData={caseData}
                caseType={caseData.caseType}
                caseNo={caseData.caseNo}
                caseYear={caseData.caseYear}
              >
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all bg-white border border-(--primary)/20 text-(--primary) hover:bg-(--primary)/5 hover:border-(--primary)/40 hover:-translate-y-0.5"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Case
                  </button>
                  <button
                    onClick={handleUnsave}
                    disabled={isRemoving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:shadow-red-500/10 hover:-translate-y-0.5 disabled:opacity-80 disabled:cursor-not-allowed"
                  >
                    {isRemoving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full"
                      />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Unsave Dashboard
                      </>
                    )}
                  </button>
                </div>
              </CaseView>

              <NotesSection
                caseId={id!}
                initialPersonalNote={caseData.personalNote}
                initialSharedNotes={caseData.sharedNotes}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {id && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          caseId={id}
        />
      )}
    </div>
  );
}
