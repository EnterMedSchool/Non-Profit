"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  StickyNote,
  Trash2,
  Edit3,
  Check,
  MessageSquare,
} from "lucide-react";
import { usePDFViewer } from "./PDFViewerContext";

export default function NotesSidebar() {
  const {
    notesPanelOpen,
    setNotesPanelOpen,
    annotations,
    currentChapter,
  } = usePDFViewer();

  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const chapterNotes = annotations.getChapterNotes(currentChapter.slug);

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    annotations.addNote({
      chapterSlug: currentChapter.slug,
      content: newNoteContent.trim(),
    });
    setNewNoteContent("");
  };

  const handleStartEdit = (noteId: string, content: string) => {
    setEditingNoteId(noteId);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (editingNoteId && editContent.trim()) {
      annotations.updateNote(editingNoteId, editContent.trim());
    }
    setEditingNoteId(null);
    setEditContent("");
  };

  return (
    <AnimatePresence>
      {notesPanelOpen && (
        <>
          {/* Overlay */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
            onClick={() => setNotesPanelOpen(false)}
            role="presentation"
          />

          {/* Panel */}
          <m.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-label="Chapter Notes"
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col border-l-3 border-showcase-navy/10 bg-white shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-showcase-navy/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-showcase-teal" />
                <h3 className="font-display text-lg font-bold text-ink-dark">
                  Notes
                </h3>
                <span className="rounded-full bg-showcase-teal/10 px-2 py-0.5 text-xs font-bold text-showcase-teal">
                  {chapterNotes.length}
                </span>
              </div>
              <button
                onClick={() => setNotesPanelOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-gray-100"
                aria-label="Close notes panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Add note input */}
            <div className="border-b-2 border-showcase-navy/10 px-5 py-3">
              <div className="flex gap-2">
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Add a note for this chapter..."
                  className="flex-1 resize-none rounded-xl border-3 border-showcase-navy/15 bg-gray-50 px-3 py-2 text-sm outline-none transition-colors placeholder:text-ink-light focus:border-showcase-teal focus:bg-white"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleAddNote();
                    }
                  }}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNoteContent.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl border-3 border-showcase-navy bg-showcase-teal text-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-chunky-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-[10px] text-ink-light">
                Ctrl+Enter to save
              </p>
            </div>

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {chapterNotes.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-showcase-teal/10">
                    <MessageSquare className="h-8 w-8 text-showcase-teal/40" />
                  </div>
                  <p className="mt-4 font-handwritten text-xl text-ink-muted">
                    No notes yet...
                  </p>
                  <p className="mt-1 text-xs text-ink-light">
                    Add your first note above
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {chapterNotes.map((note) => (
                    <li
                      key={note.id}
                      className="group rounded-xl border-2 border-showcase-navy/10 bg-gray-50/50 p-3 transition-colors hover:border-showcase-teal/20"
                    >
                      {editingNoteId === note.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full resize-none rounded-lg border-2 border-showcase-teal bg-white px-3 py-2 text-sm outline-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="rounded-lg px-3 py-1 text-xs font-semibold text-ink-muted hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="flex items-center gap-1 rounded-lg bg-showcase-teal px-3 py-1 text-xs font-semibold text-white"
                            >
                              <Check className="h-3 w-3" /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap text-sm text-ink-dark">
                            {note.content}
                          </p>
                            <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] text-ink-light">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex gap-1 opacity-100 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
                              <button
                                onClick={() =>
                                  handleStartEdit(note.id, note.content)
                                }
                                className="flex h-6 w-6 items-center justify-center rounded text-ink-light hover:bg-gray-200 hover:text-ink-dark"
                                title="Edit"
                                aria-label="Edit note"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => annotations.removeNote(note.id)}
                                className="flex h-6 w-6 items-center justify-center rounded text-ink-light hover:bg-red-50 hover:text-red-500"
                                title="Delete"
                                aria-label="Delete note"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Chapter indicator */}
            <div className="border-t-2 border-showcase-navy/10 px-5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-light">
                Chapter {currentChapter.number}
              </p>
              <p className="text-xs text-ink-muted">{currentChapter.title}</p>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
