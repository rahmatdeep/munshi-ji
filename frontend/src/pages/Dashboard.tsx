/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LogOut,
  FileText,
  Scale,
  Calendar,
  Hash,
  CheckCircle,
  Info,
  ChevronRight,
  Briefcase,
} from "lucide-react";

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

export default function Dashboard() {
  const [caseType, setCaseType] = useState("CWP");
  const [caseNo, setCaseNo] = useState("");
  const [caseYear, setCaseYear] = useState(new Date().getFullYear().toString());
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [caseData, setCaseData] = useState<any>(null);
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
      setStatus("success");
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
                className="w-full flex flex-col gap-6"
              >
                <div className="glass-card rounded-3xl p-8 md:p-10 border-white/50 bg-white/40 shadow-xl shadow-(--color-sage)/5">
                  <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1.5 rounded-lg text-xs font-black tracking-widest bg-(--color-sage)/20 text-(--primary) border border-(--color-sage)/30 shadow-sm">
                          {caseType} - {caseNo} / {caseYear}
                        </span>
                        {caseData.status && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-(--primary) text-(--primary-fg) shadow-sm">
                            <CheckCircle className="w-3 h-3" />
                            {caseData.status}
                          </span>
                        )}
                      </div>
                      <h2 className="text-3xl md:text-5xl font-serif-logo font-bold text-(--foreground) leading-tight mb-2">
                        {caseData.petName || "Petitioner"}
                      </h2>
                      <p className="text-(--color-sage) italic text-xl md:text-2xl font-serif-logo my-1">
                        versus
                      </p>
                      <h2 className="text-3xl md:text-5xl font-serif-logo font-bold text-(--foreground) leading-tight">
                        {caseData.resName || "Respondent"}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 pt-8 border-t border-(--color-tan)/30">
                    {/* Meta Group 1 */}
                    <div className="space-y-4">
                      <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
                        <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                          <Briefcase className="w-3 h-3" /> Registration Date
                        </p>
                        <p className="text-sm font-semibold text-(--foreground)">
                          {caseData.regDate
                            ? new Date(caseData.regDate).toLocaleDateString()
                            : "Not specified"}
                        </p>
                      </div>
                      <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
                        <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                          <Calendar className="w-3 h-3" /> Next Listing Date
                        </p>
                        <p className="text-sm font-semibold text-(--foreground)">
                          {caseData.nextListingDate
                            ? new Date(
                                caseData.nextListingDate,
                              ).toLocaleDateString()
                            : "Not required"}
                        </p>
                      </div>
                      <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
                        <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3" /> Status
                        </p>
                        <p className="text-sm font-semibold text-(--foreground) leading-tight">
                          {caseData.status || "Not specified"}{" "}
                          {caseData.disposalDate && (
                            <span className="text-xs text-(--color-sage) block mt-1">
                              on{" "}
                              {new Date(
                                caseData.disposalDate,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Meta Group 2 */}
                    <div className="space-y-4">
                      <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
                        <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                          <Hash className="w-3 h-3" /> CNR / Diary No
                        </p>
                        <div className="text-sm font-semibold text-(--foreground)">
                          <span
                            className="font-mono block truncate"
                            title={caseData.cnrNo}
                          >
                            {caseData.cnrNo || "N/A"}
                          </span>
                          <span className="text-xs text-(--color-sage) block mt-1">
                            Diary:{" "}
                            {caseData.rawData?.caseResponse?.case_diary_no ||
                              caseData.filingNo ||
                              "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
                        <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                          <FileText className="w-3 h-3" /> Category
                        </p>
                        <p className="text-sm font-semibold text-(--foreground) leading-snug">
                          {caseData.categoryDesc?.trim() || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
                        <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-2">
                          <Search className="w-3 h-3" /> District
                        </p>
                        <p className="text-sm font-semibold text-(--foreground)">
                          {caseData.district || "Not specified"}
                        </p>
                      </div>
                    </div>

                    {/* Meta Group 3 */}
                    <div className="space-y-4">
                      <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
                        <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1">
                          Petitioner Counsel
                        </p>
                        <p className="text-sm font-semibold text-(--foreground)">
                          {caseData.petAdvName || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
                        <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1">
                          Respondent Counsel
                        </p>
                        <p className="text-sm font-semibold text-(--foreground)">
                          {caseData.resAdvName || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-white/40 rounded-2xl p-4 border border-white/50 hover:bg-white/60 transition-colors">
                        <p className="text-[10px] text-(--color-sage) uppercase tracking-[0.2em] font-bold mb-1">
                          Bench Info
                        </p>
                        <p className="text-xs font-semibold text-(--foreground) leading-snug">
                          {caseData.benchName || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Listings & Judgments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12 w-full">
                  {caseData.hearings && caseData.hearings.length > 0 && (
                    <div className="glass-card rounded-3xl p-6 border-white/50 bg-white/40 h-full">
                      <h3 className="text-sm uppercase tracking-widest font-bold text-(--color-sage) mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Case Listing Details
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-(--color-tan)/30 bg-white/30 hidden-scrollbar">
                        <table className="w-full text-left text-xs text-(--foreground)">
                          <thead className="bg-white/50 border-b border-(--color-tan)/30 whitespace-nowrap">
                            <tr>
                              <th className="px-4 py-3 font-bold text-(--color-sage) uppercase tracking-wider">
                                Cause List Date
                              </th>
                              <th className="px-4 py-3 font-bold text-(--color-sage) uppercase tracking-wider">
                                Type / Sr No
                              </th>
                              <th className="px-4 py-3 font-bold text-(--color-sage) uppercase tracking-wider">
                                Bench
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {caseData.hearings.map((h: any, i: number) => (
                              <tr
                                key={i}
                                className="border-b border-(--color-tan)/20 last:border-0 hover:bg-white/20 transition-colors"
                              >
                                <td className="px-4 py-3 font-medium whitespace-nowrap">
                                  {new Date(h.hearingDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  {h.listType} : {h.srNo}
                                </td>
                                <td
                                  className="px-4 py-3 max-w-50 truncate"
                                  title={h.benchName}
                                >
                                  {h.benchName}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {caseData.orders && caseData.orders.length > 0 && (
                    <div className="glass-card rounded-3xl p-6 border-white/50 bg-white/40 h-full">
                      <h3 className="text-sm uppercase tracking-widest font-bold text-(--color-sage) mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Judgment Details
                      </h3>
                      <div className="overflow-x-auto rounded-xl border border-(--color-tan)/30 bg-white/30 hidden-scrollbar">
                        <table className="w-full text-left text-xs text-(--foreground)">
                          <thead className="bg-white/50 border-b border-(--color-tan)/30 whitespace-nowrap">
                            <tr>
                              <th className="px-4 py-3 font-bold text-(--color-sage) uppercase tracking-wider">
                                Order Date
                              </th>
                              <th className="px-4 py-3 font-bold text-(--color-sage) uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-4 py-3 font-bold text-(--color-sage) uppercase tracking-wider">
                                Bench
                              </th>
                              <th className="px-4 py-3 font-bold text-(--color-sage) uppercase tracking-wider text-right">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {caseData.orders.map((o: any, i: number) => (
                              <tr
                                key={i}
                                className="border-b border-(--color-tan)/20 last:border-0 hover:bg-white/20 transition-colors"
                              >
                                <td className="px-4 py-3 font-medium whitespace-nowrap">
                                  {new Date(o.orderDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  {o.orderType === "F"
                                    ? "Final Order"
                                    : o.orderType}
                                </td>
                                <td
                                  className="px-4 py-3 max-w-50 truncate"
                                  title={o.benchName}
                                >
                                  {o.benchName}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {o.pdfUrl ? (
                                    <a
                                      href={o.pdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center p-1.5 rounded-lg bg-(--primary)/10 text-(--primary) hover:bg-(--primary) hover:text-(--primary-fg) transition-colors font-semibold"
                                      title="View PDF"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <details className="group glass-card rounded-3xl border-white/50 bg-white/20 mb-12">
                  <summary className="px-8 py-5 text-sm font-bold text-(--foreground) cursor-pointer select-none transition-colors flex items-center outline-none">
                    <FileText className="w-4 h-4 mr-3 text-(--color-sage)" />
                    View Complete Raw Payload
                    <ChevronRight className="w-4 h-4 ml-auto text-(--color-sage) transform transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="p-8 pt-0 overflow-x-auto border-t border-(--color-tan)/20">
                    <pre className="text-xs text-(--foreground) font-mono leading-relaxed bg-white/40 p-6 rounded-2xl shadow-inner wrap-break-word whitespace-pre-wrap mt-6">
                      {JSON.stringify(caseData, null, 2)}
                    </pre>
                  </div>
                </details>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
