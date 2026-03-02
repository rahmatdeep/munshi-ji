import React, { useState, useEffect } from "react";
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
}

export default function NotesSection({
  caseId,
  initialPersonalNote,
  initialSharedNotes,
}: NotesSectionProps) {
  const [personalContent, setPersonalContent] = useState(
    initialPersonalNote?.content || "",
  );
  const [sharedNotes, setSharedNotes] = useState<Note[]>(
    initialSharedNotes || [],
  );
  const [newSharedContent, setNewSharedContent] = useState("");

  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isPostingShared, setIsPostingShared] = useState(false);
  const [error, setError] = useState("");

  // Get current user ID to determine which shared notes can be deleted
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        );

        const decoded = JSON.parse(jsonPayload);
        setCurrentUserId(decoded.userId);
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
  }, []);

  const handleSavePersonalNote = async () => {
    setIsSavingPersonal(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/cases/${caseId}/personal-note`,
        { content: personalContent },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Briefly show success state if needed
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save personal note");
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleClearPersonalNote = async () => {
    if (!personalContent && !initialPersonalNote) return;
    if (!confirm("Are you sure you want to delete your personal note?")) return;

    setIsSavingPersonal(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/cases/${caseId}/personal-note`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPersonalContent("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete personal note");
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handlePostSharedNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSharedContent.trim()) return;

    setIsPostingShared(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/cases/${caseId}/shared-notes`,
        { content: newSharedContent },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSharedNotes([response.data.sharedNote, ...sharedNotes]);
      setNewSharedContent("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to post shared note");
    } finally {
      setIsPostingShared(false);
    }
  };

  const handleDeleteSharedNote = async (noteId: string) => {
    if (!confirm("Delete this shared note?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/api/cases/${caseId}/shared-notes/${noteId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSharedNotes(sharedNotes.filter((n) => n.id !== noteId));
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete shared note");
    }
  };

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {error && (
        <div className="col-span-1 lg:col-span-2 flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Personal Notes Section */}
      <div className="glass-card bg-white/40 p-6 md:p-8 rounded-3xl border border-(--color-tan)/30 shadow-xl shadow-(--color-sage)/5 flex flex-col h-125">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#6B5A3A]/10 flex items-center justify-center border border-[#6B5A3A]/20">
            <FileText className="w-5 h-5 text-[#6B5A3A]" />
          </div>
          <div>
            <h3 className="font-serif-logo font-bold text-xl text-(--foreground)">
              Personal Notes
            </h3>
            <p className="text-xs text-(--color-sage) font-medium">
              Private to you. Not shared with others.
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative group">
          <textarea
            value={personalContent}
            onChange={(e) => setPersonalContent(e.target.value)}
            placeholder="Type your private case notes, strategies, or reminders here..."
            className="w-full flex-1 resize-none bg-white/60 border-2 border-(--color-tan)/50 rounded-2xl p-5 text-sm leading-relaxed text-(--foreground) outline-none focus:border-(--color-brown) focus:ring-4 focus:ring-(--color-brown)/10 transition-all placeholder:text-(--color-sage)/70"
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleClearPersonalNote}
            disabled={!personalContent || isSavingPersonal}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
          <button
            onClick={handleSavePersonalNote}
            disabled={isSavingPersonal}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-(--primary) text-white hover:bg-[#726242] transition-colors shadow-lg shadow-(--primary)/20 disabled:opacity-70 flex items-center gap-2"
          >
            {isSavingPersonal ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Notes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Shared Notes Section */}
      <div className="glass-card bg-white/40 p-6 md:p-8 rounded-3xl border border-(--color-tan)/30 shadow-xl shadow-(--color-sage)/5 flex flex-col h-125">
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-(--primary)/10 flex items-center justify-center border border-(--primary)/20">
            <Users className="w-5 h-5 text-(--primary)" />
          </div>
          <div>
            <h3 className="font-serif-logo font-bold text-xl text-(--foreground)">
              Discussion Board
            </h3>
            <p className="text-xs text-(--color-sage) font-medium">
              Visible to everyone who has saved this case.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4 custom-scrollbar">
          {sharedNotes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <MessageSquare className="w-12 h-12 text-(--color-sage) mb-3" />
              <p className="text-sm font-medium text-(--foreground)">
                No discussions yet.
              </p>
              <p className="text-xs text-(--color-sage) mt-1 max-w-50">
                Be the first to share an insight or question about this case.
              </p>
            </div>
          ) : (
            sharedNotes.map((note) => {
              const isAuthor = note.userId === currentUserId;
              return (
                <div
                  key={note.id}
                  className={`p-4 rounded-2xl text-sm ${isAuthor ? "bg-(--primary)/5 border border-(--primary)/20 ml-8" : "bg-white border border-(--color-tan)/40 mr-8"}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-(--foreground)">
                        {note.user?.name || note.user?.email || "Unknown User"}
                      </span>
                      <span className="text-[10px] text-(--color-sage) ml-2">
                        {new Date(note.createdAt).toLocaleDateString()}{" "}
                        {new Date(note.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {isAuthor && (
                      <button
                        onClick={() => handleDeleteSharedNote(note.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-(--foreground) whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <form
          onSubmit={handlePostSharedNote}
          className="shrink-0 mt-auto relative"
        >
          <input
            type="text"
            value={newSharedContent}
            onChange={(e) => setNewSharedContent(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-white/80 border-2 border-(--color-tan)/50 rounded-xl pl-4 pr-12 py-3 text-sm font-medium text-(--foreground) outline-none focus:border-(--primary) transition-colors"
          />
          <button
            type="submit"
            disabled={!newSharedContent.trim() || isPostingShared}
            className="absolute right-2 top-2 p-1.5 bg-(--primary) text-white rounded-lg hover:bg-[#726242] disabled:opacity-50 transition-colors"
          >
            {isPostingShared ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
