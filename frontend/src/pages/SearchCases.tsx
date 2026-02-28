/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LogOut,
  Scale,
  Calendar,
  Hash,
  CheckCircle,
  Info,
  ChevronRight,
  Briefcase,
  BookmarkMinus,
  Share2,
} from "lucide-react";
import CaseView from "../components/CaseView";
import ShareModal from "../components/ShareModal";

const VALID_CASE_TYPES = [
  "CWP",
  "CRM-M",
  "CR",
  "RSA",
  "CRR",
  "CRA-S",
  "FAO",
  "CM",
  "CRM",
  "ARB",
  "ARB-DC",
  "ARB-ICA",
  "CA",
  "CA-CWP",
  "CA-MISC",
  "CACP",
  "CAPP",
  "CCEC",
  "CCES",
  "CEA",
  "CEC",
  "CEGC",
  "CESR",
  "CLAIM",
  "CM-INCOMP",
  "CMA",
  "CMM",
  "CO",
  "CO-COM",
  "COA",
  "COCP",
  "COMM-PET-M",
  "CP",
  "CP-MISC",
  "CR-COM",
  "CRA",
  "CRA-AD",
  "CRA-AS",
  "CRA-D",
  "CRACP",
  "CREF",
  "CRM-A",
  "CRM-CLT-OJ",
  "CRM-W",
  "CROCP",
  "CRR(F)",
  "CRREF",
  "CRWP",
  "CS",
  "CS-OS",
  "CUSAP",
  "CWP-COM",
  "CWP-PIL",
  "DP",
  "EA",
  "EDC",
  "EDREF",
  "EFA",
  "EFA-COM",
  "EP",
  "EP-COM",
  "ESA",
  "FAO(FC)",
  "FAO-C",
  "FAO-CARB",
  "FAO-COM",
  "FAO-ICA",
  "FAO-M",
  "FEMA-APPL",
  "FORM-8A",
  "GCR",
  "GSTA",
  "GSTR",
  "GTA",
  "GTC",
  "GTR",
  "GVATR",
  "INCOMP",
  "INTTA",
  "IOIN",
  "ITA",
  "ITC",
  "ITR",
  "LPA",
  "LR",
  "MATRF",
  "MRC",
  "O&M",
  "OLR",
  "PBPT-APPL",
  "PBT",
  "PMLA-APPL",
  "PVR",
  "RA",
  "RA-CA",
  "RA-CP",
  "RA-CR",
  "RA-CW",
  "RA-LP",
  "RA-RF",
  "RA-RS",
  "RCRWP",
  "RERA-APPL",
  "RFA",
  "RFA-COM",
  "RP",
  "SA",
  "SAO",
  "SAO(FS)",
  "SDR",
  "STA",
  "STC",
  "STR",
  "TA",
  "TA-COM",
  "TC",
  "TCRM",
  "TEST",
  "UVA",
  "UVR",
  "VATAP",
  "VATCASE",
  "VATREF",
  "WTA",
  "WTC",
  "WTR",
  "XOBJ",
  "XOBJC",
  "XOBJL",
  "XOBJR",
  "XOBJS",
];

export default function SearchCases() {
  const [caseType, setCaseType] = useState("CWP");
  const [caseNo, setCaseNo] = useState("");
  const [caseYear, setCaseYear] = useState(new Date().getFullYear().toString());
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [caseData, setCaseData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedCaseId, setSavedCaseId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseType || !caseNo || !caseYear) return;

    setStatus("loading");
    setError("");
    setCaseData(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3000/api/cases/fetch",
        {
          case_type: caseType,
          case_no: caseNo,
          case_year: parseInt(caseYear, 10),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCaseData(response.data.case);
      setIsSaved(response.data.isSaved || false);
      setSavedCaseId(response.data.caseId || null);
      setStatus("success");
      setSaveSuccess(false); // Reset save state on new search
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to fetch case. Please try again.",
      );
      setStatus("error");
    }
  };

  const handleSaveCase = async () => {
    if (!caseData) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3000/api/cases/save",
        {
          caseType: caseType,
          caseNo: caseNo,
          caseYear: parseInt(caseYear, 10),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const newCaseId = response.data.caseId;
      setSavedCaseId(newCaseId);
      setIsSaved(true);
      setSaveSuccess(true);
      // Automatically clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      alert(
        err.response?.data?.error || "Failed to save case. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsaveCase = async () => {
    if (!savedCaseId) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/cases/unsave",
        {
          caseId: savedCaseId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setIsSaved(false);
      setSavedCaseId(null);
    } catch (err: any) {
      console.error("Unsave error:", err);
      alert(
        err.response?.data?.error || "Failed to unsave case. Please try again.",
      );
    } finally {
      setIsSaving(false);
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
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-sm font-semibold text-(--primary) transition-all px-4 py-2 rounded-full hover:bg-(--primary)/10 border border-transparent hover:border-(--primary)/30"
            >
              <span>My Saved Cases</span>
            </button>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={handleLogout}
            className="group flex items-center gap-2 text-sm font-semibold text-(--foreground) transition-all border-2 border-(--color-tan) px-5 py-2.5 rounded-full hover:bg-(--color-tan)/30 hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="hidden sm:inline">Sign Out</span>
            <LogOut className="w-4 h-4 text-(--color-sage) group-hover:text-(--foreground) transition-colors" />
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-10 relative z-10 flex flex-col justify-start gap-8 md:gap-10">
        {/* Top Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card w-full rounded-3xl p-6 md:p-8 shadow-2xl shadow-(--color-sage)/10 border-white/40 z-20 relative bg-white/40 backdrop-blur-xl"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-serif-logo font-bold text-(--foreground) tracking-tight mb-2">
              Case Query
            </h2>
            <p className="text-sm font-medium text-(--color-sage) leading-relaxed">
              Enter parameters to instantly retrieve highly detailed records
              from the High Court database.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-4 items-end"
          >
            <div className="w-full md:flex-1 space-y-2">
              <label
                htmlFor="caseType"
                className="text-xs font-bold text-(--foreground) uppercase tracking-wider flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-(--color-sage)" /> Case Type
              </label>
              <div className="relative group">
                <select
                  id="caseType"
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="w-full bg-white/50 border-2 border-(--color-tan)/50 rounded-xl px-4 py-3 text-sm font-semibold text-(--foreground) outline-none focus:border-(--color-brown) focus:ring-4 focus:ring-(--color-brown)/10 transition-all appearance-none cursor-pointer"
                >
                  {VALID_CASE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-(--color-sage)">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            <div className="w-full md:flex-1 space-y-2">
              <label
                htmlFor="caseNo"
                className="text-xs font-bold text-(--foreground) uppercase tracking-wider flex items-center gap-2"
              >
                <Hash className="w-4 h-4 text-(--color-sage)" /> Case Number
              </label>
              <input
                id="caseNo"
                type="text"
                required
                value={caseNo}
                onChange={(e) => setCaseNo(e.target.value)}
                className="w-full bg-white/50 border-2 border-(--color-tan)/50 rounded-xl px-4 py-3 text-sm font-semibold text-(--foreground) outline-none focus:border-(--color-brown) focus:ring-4 focus:ring-(--color-brown)/10 transition-all placeholder:text-(--color-tan) placeholder:font-normal"
                placeholder="e.g. 1234"
              />
            </div>

            <div className="w-full md:flex-1 space-y-2">
              <label
                htmlFor="caseYear"
                className="text-xs font-bold text-(--foreground) uppercase tracking-wider flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-(--color-sage)" /> Year
              </label>
              <input
                id="caseYear"
                type="number"
                required
                min="1900"
                max="2100"
                value={caseYear}
                onChange={(e) => setCaseYear(e.target.value)}
                className="w-full bg-white/50 border-2 border-(--color-tan)/50 rounded-xl px-4 py-3 text-sm font-semibold text-(--foreground) outline-none focus:border-(--color-brown) focus:ring-4 focus:ring-(--color-brown)/10 transition-all"
              />
            </div>

            <div className="w-full md:w-auto md:min-w-50 pt-4 md:pt-0">
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex justify-center items-center gap-3 py-3.5 px-6 rounded-xl shadow-lg shadow-(--primary)/20 text-sm font-bold text-(--primary-fg) bg-(--primary) hover:bg-[#726242] focus:outline-none focus:ring-4 focus:ring-(--primary)/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98] overflow-hidden"
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
                    <Search className="w-4 h-4" />
                    Retrieve Record
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results Area */}
        <div className="flex-1 w-full relative min-h-100 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center max-w-md mx-auto my-auto glass-card rounded-3xl p-10 bg-white/30 border-white/50"
              >
                <div className="w-20 h-20 rounded-2xl bg-(--color-tan)/20 border-2 border-(--color-tan)/30 flex items-center justify-center mx-auto mb-6 rotate-3">
                  <Scale className="w-10 h-10 text-(--color-sage) -rotate-3" />
                </div>
                <h3 className="text-xl font-serif-logo font-bold text-(--foreground) mb-2">
                  Ready to Query
                </h3>
                <p className="text-sm font-medium text-(--muted-fg) leading-relaxed">
                  Enter parameters above to securely pull case details,
                  hearings, and judgments from the centralized datastore.
                </p>
              </motion.div>
            )}

            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center my-auto flex flex-col items-center justify-center glass-card rounded-3xl p-12 bg-white/30 border-white/50 max-w-md mx-auto"
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
                    <Search className="w-5 h-5 text-(--primary) animate-pulse" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-(--foreground) mb-1">
                  Connecting to Database
                </h3>
                <p className="text-sm font-medium text-(--color-sage)">
                  Extracting records securely...
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
                <div className="w-16 h-16 rounded-2xl bg-red-100/60 border-2 border-red-200/50 flex items-center justify-center mx-auto mb-6">
                  <Info className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  Query Failed
                </h3>
                <p className="text-sm font-medium text-red-700/90 leading-relaxed bg-red-100/50 p-4 rounded-xl border border-red-200/50">
                  {error}
                </p>
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
                  caseType={caseType}
                  caseNo={caseNo}
                  caseYear={caseYear}
                >
                  {isSaved ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all bg-white border border-(--primary)/20 text-(--primary) hover:bg-(--primary)/5 hover:border-(--primary)/40 hover:-translate-y-0.5"
                      >
                        <Share2 className="w-4 h-4" />
                        Share Case
                      </button>
                      <button
                        onClick={handleUnsaveCase}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-red-500/10 hover:-translate-y-0.5 disabled:opacity-80 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full"
                          />
                        ) : (
                          <>
                            <BookmarkMinus className="w-4 h-4" />
                            Unsave Case
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSaveCase}
                      disabled={isSaving || saveSuccess}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${
                        saveSuccess
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-green-600/20"
                          : "bg-(--primary) hover:bg-[#726242] text-(--primary-fg) shadow-(--primary)/20 hover:-translate-y-0.5"
                      } disabled:opacity-80 disabled:cursor-not-allowed`}
                    >
                      {isSaving ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : saveSuccess ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Saved to Dashboard
                        </>
                      ) : (
                        <>
                          <Briefcase className="w-4 h-4" />
                          Save Case
                        </>
                      )}
                    </button>
                  )}
                </CaseView>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {savedCaseId && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          caseId={savedCaseId}
        />
      )}
    </div>
  );
}
