import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../lib/api";
import { motion } from "framer-motion";
import {
  FileText,
  Users,
  Send,
  Trash2,
  Save,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { useConfirm } from "../hooks/useConfirm";
import { formatDate } from "../lib/date";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    name: string | null;
    email: string;
  };
  userId?: string;
}

interface NotesSectionProps {
  caseId: string;
  initialPersonalNote: Note | null;
  initialSharedNotes: Note[];
  isSaved: boolean;
}

export default function NotesSection({
  caseId,
  initialPersonalNote,
  initialSharedNotes,
  isSaved,
}: NotesSectionProps) {
  const [personalContent, setPersonalContent] = useState(
    initialPersonalNote?.content || "",
  );
  const [sharedNotes, setSharedNotes] = useState<Note[]>(
    initialSharedNotes || [],
  );
  const [newSharedContent, setNewSharedContent] = useState("");
  const confirm = useConfirm();

  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isPostingShared, setIsPostingShared] = useState(false);
  const [error, setError] = useState("");

  // Get current user ID to determine which shared notes can be deleted
  const [currentUserId] = useState<string | null>(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        return user.userId;
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    return null;
  });

  const handleSavePersonalNote = async () => {
    if (!isSaved) return;
    setIsSavingPersonal(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/cases/${caseId}/personal-note`,
        { content: personalContent },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to save personal note");
      } else {
        setError("Failed to save personal note");
      }
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleClearPersonalNote = async () => {
    if (!isSaved) return;
    if (!personalContent && !initialPersonalNote) return;
    const confirmed = await confirm({
      title: "Delete Personal Note",
      message: "Are you sure you want to delete your personal note?",
      confirmLabel: "Delete Note",
      variant: "danger",
    });

    if (!confirmed) return;

    setIsSavingPersonal(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/cases/${caseId}/personal-note`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPersonalContent("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to delete personal note");
      } else {
        setError("Failed to delete personal note");
      }
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handlePostSharedNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSaved || !newSharedContent.trim()) return;

    setIsPostingShared(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/cases/${caseId}/shared-notes`,
        { content: newSharedContent },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSharedNotes([...sharedNotes, response.data.sharedNote]);
      setNewSharedContent("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to post shared note");
      } else {
        setError("Failed to post shared note");
      }
    } finally {
      setIsPostingShared(false);
    }
  };

  const handleDeleteSharedNote = async (noteId: string) => {
    if (!isSaved) return;
    const confirmed = await confirm({
      title: "Delete Shared Note",
      message: "Delete this shared note?",
      confirmLabel: "Delete Note",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/api/cases/${caseId}/shared-notes/${noteId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSharedNotes(sharedNotes.filter((n) => n.id !== noteId));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to delete shared note");
      } else {
        setError("Failed to delete shared note");
      }
    }
  };

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 relative pb-20">
      {error && (
        <div className="col-span-1 lg:col-span-2 flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-4">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="glass-card p-6 md:p-8 rounded-3xl border border-(--muted)/30 shadow-2xl shadow-5 flex flex-col h-125 relative overflow-hidden group">
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-(--primary-hover)/10 flex items-center justify-center border border-(--primary-hover)/20 shadow-inner">
            <FileText className="w-6 h-6 text-(--primary-hover)" />
          </div>
          <div>
            <h3 className="font-serif-logo font-bold text-2xl text-(--foreground) tracking-tight">
              Personal Notepad
            </h3>
            <p className="text-[10px] text-(--secondary) font-black uppercase tracking-widest">
              Private Workspace
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative group/textarea z-10">
          <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-red-200/40 via-red-200/20 to-red-200/40 rounded-full ml-1" />
          <textarea
            value={personalContent}
            onChange={(e) => setPersonalContent(e.target.value)}
            disabled={!isSaved}
            placeholder={
              isSaved
                ? "Draft your private notes, strategies, or reminders here..."
                : ""
            }
            className={`w-full flex-1 resize-none bg-white/60 border-2 border-(--muted)/30 rounded-2xl p-6 pl-10 text-base leading-loose text-(--foreground) outline-none focus:border-(--primary) focus:ring-8 focus:ring-(--primary)/5 transition-all placeholder:text-(--secondary)/50 font-medium ${!isSaved ? "cursor-not-allowed opacity-50" : ""}`}
            style={{
              backgroundImage: "linear-gradient(#f1eee0 1px, transparent 1px)",
              backgroundSize: "100% 2.5rem",
              lineHeight: "2.5rem",
            }}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 relative z-10">
          <button
            onClick={handleClearPersonalNote}
            disabled={!personalContent || isSavingPersonal || !isSaved}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all disabled:opacity-30 flex items-center gap-2 active:scale-95"
          >
            <Trash2 className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={handleSavePersonalNote}
            disabled={isSavingPersonal || !isSaved}
            className="px-8 py-2.5 rounded-xl text-sm font-bold bg-(--primary) text-white hover:bg-(--primary-hover) transition-all shadow-xl shadow-(--primary)/20 disabled:opacity-30 flex items-center gap-2 active:scale-95"
          >
            {isSavingPersonal ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <Save className="w-4 h-4" /> Save
              </>
            )}
          </button>
        </div>

        {!isSaved && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex items-center justify-center p-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card bg-white p-6 rounded-2xl shadow-2xl border border-(--muted)/40"
            >
              <div className="w-12 h-12 bg-(--primary)/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Save className="w-6 h-6 text-(--primary)" />
              </div>
              <p className="text-sm font-bold text-(--foreground) mb-1">
                Personal Notepad Locked
              </p>
              <p className="text-xs text-(--secondary) font-medium">
                Save this case to start drafting private notes.
              </p>
            </motion.div>
          </div>
        )}
      </div>

      <div className="glass-card p-6 md:p-8 rounded-3xl border border-(--muted)/30 shadow-2xl shadow-5 flex flex-col h-125 relative overflow-hidden group">
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-(--primary)/10 flex items-center justify-center border border-(--primary)/20 shadow-inner">
            <Users className="w-6 h-6 text-(--primary)" />
          </div>
          <div>
            <h3 className="font-serif-logo font-bold text-2xl text-(--foreground) tracking-tight">
              Collaborative Insights
            </h3>
            <p className="text-[10px] text-(--secondary) font-black uppercase tracking-widest">
              Team Intelligence
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 custom-scrollbar relative z-10">
          {sharedNotes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <MessageSquare className="w-16 h-16 text-(--secondary) mb-4" />
              <p className="text-sm font-bold text-(--foreground)">
                The record is clear.
              </p>
              <p className="text-xs text-(--secondary) mt-1 max-w-50 font-medium font-sans">
                Be the first to share an insight with the team.
              </p>
            </div>
          ) : (
            sharedNotes.map((note) => {
              const isAuthor = note.userId === currentUserId;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={note.id}
                  className={`p-5 rounded-2xl ${isAuthor ? "bg-(--primary)/5 border border-(--primary)/10 ml-10" : "bg-white border border-(--muted)/30 mr-10"} shadow-sm transition-all hover:shadow-md`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isAuthor ? "bg-(--primary) text-white" : "bg-(--muted) text-(--primary)"}`}
                      >
                        {(note.user?.name ||
                          note.user?.email ||
                          "U")[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-(--foreground) leading-none">
                          {note.user?.name || note.user?.email}
                        </span>
                        <span className="text-[9px] text-(--secondary) font-bold uppercase tracking-tighter mt-0.5">
                          {formatDate(note.createdAt)} at{" "}
                          {((): string => {
                            const d = note.createdAt;
                            let normalized = d;
                            if (typeof d === "string") {
                              const trimmed = d.trim();
                              if (trimmed.length <= 10 && !trimmed.includes("T") && !trimmed.includes(":")) {
                                if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                                  normalized = `${trimmed}T00:00:00+05:30`;
                                } else if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
                                  const [dd, mm, yyyy] = trimmed.split("-");
                                  normalized = `${yyyy}-${mm}-${dd}T00:00:00+05:30`;
                                }
                              }
                            }
                            return new Date(normalized).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                          })()}
                        </span>
                      </div>
                    </div>
                    {isAuthor && isSaved && (
                      <button
                        onClick={() => handleDeleteSharedNote(note.id)}
                        className="text-(--secondary) hover:text-red-500 transition-colors p-1"
                        title="Remove entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-medium text-(--foreground) leading-relaxed whitespace-pre-wrap font-sans">
                    {note.content}
                  </p>
                </motion.div>
              );
            })
          )}
        </div>

        <form
          onSubmit={handlePostSharedNote}
          className="shrink-0 mt-auto relative z-10"
        >
          <div className="relative group">
            <input
              type="text"
              value={newSharedContent}
              onChange={(e) => setNewSharedContent(e.target.value)}
              disabled={!isSaved}
              placeholder={
                isSaved ? "Contribute to the legal strategy..." : "Locked"
              }
              className={`w-full bg-white/80 border-2 border-(--muted)/50 rounded-3xl pl-6 pr-14 py-4 text-sm font-bold text-(--foreground) outline-none focus:border-(--primary) focus:ring-8 focus:ring-(--primary)/5 transition-all placeholder:text-(--secondary)/40 ${!isSaved ? "cursor-not-allowed opacity-50" : ""}`}
            />
            <button
              type="submit"
              disabled={!newSharedContent.trim() || isPostingShared || !isSaved}
              className="absolute right-2.5 top-2.5 p-2 bg-(--primary) text-white rounded-xl hover:bg-(--primary-hover) disabled:opacity-20 transition-all shadow-lg active:scale-90"
            >
              {isPostingShared ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <Send className="w-5 h-5 translate-x-0.5 -translate-y-0.5" />
              )}
            </button>
          </div>
        </form>

        {!isSaved && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex items-center justify-center p-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card bg-white p-6 rounded-2xl shadow-2xl border border-(--muted)/40"
            >
              <div className="w-12 h-12 bg-(--primary)/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-(--primary)" />
              </div>
              <p className="text-sm font-bold text-(--foreground) mb-1">
                Collaboration Locked
              </p>
              <p className="text-xs text-(--secondary) font-medium">
                Save this case to join the discussion board.
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
