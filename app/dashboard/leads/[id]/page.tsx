"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
});
import { ArrowLeft, Search, Save, Plus, Trash2, Edit2 } from "lucide-react";
import {
  getById,
  getNotes,
  addNote,
  updateNoteApi,
  deleteNoteApi,
} from "@/app/utils/api";

export default function ViewLeadPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [lead, setLead] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "activity" | "notes" | "emails" | "calls" | "task" | "meetings"
  >("notes");

  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNoteHtml, setNewNoteHtml] = useState("");

  // 👉 New state for showing info
  const [infoType, setInfoType] = useState<"email" | "phone" | null>(null);

  // Fetch lead details
  useEffect(() => {
    (async () => {
      try {
        const res = await getById("lead", id);
        setLead(res?.data || res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Fetch notes for this lead
  useEffect(() => {
    (async () => {
      try {
        const res = await getNotes(id);
        setNotes(res?.data || []);
      } catch (e) {
        console.error("Error fetching notes", e);
      }
    })();
  }, [id]);

  // Add note
  const handleAddNote = async () => {
    const content = (newNoteHtml || newNote).trim();
    if (!content) return;
    try {
      const res = await addNote(id, { content });
      setNotes((prev) => [res.data, ...prev]);
      setNewNote("");
      setNewNoteHtml("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  // Update note
  const handleEditNote = async (noteId: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await updateNoteApi(noteId, { content: editContent.trim() });
      setNotes((prev) =>
        prev.map((note) => (note._id === noteId ? res.data : note))
      );
      setEditingNote(null);
      setEditContent("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Error updating note:", err);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNoteApi(noteId);
      setNotes((prev) => prev.filter((note) => note._id !== noteId));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const startEdit = (note: any) => {
    setEditingNote(note._id);
    setEditContent(note.content);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditContent("");
  };

  // Toggle Email / Phone
  const handleToggleInfo = (type: "email" | "phone") => {
    if (infoType === type) {
      setInfoType(null);
    } else {
      setInfoType(type);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lead Card */}
        <Card className="md:col-span-1">
          <div className="mb-3 pt-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/leads")}
              className="px-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to leads
            </Button>
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <span className="font-semibold text-lg">
                  {(lead?.firstName || "-").slice(0, 1)}
                </span>
              </div>
              <div>
                <div className="text-lg font-semibold">{lead?.firstName || "-"}</div>
              </div>
            </div>

            {/* Email / Call Buttons */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <Button
                variant={infoType === "email" ? "default" : "outline"}
                className="h-9"
                onClick={() => handleToggleInfo("email")}
              >
                Email
              </Button>
              <Button
                variant={infoType === "phone" ? "default" : "outline"}
                className="h-9"
                onClick={() => handleToggleInfo("phone")}
              >
                Call
              </Button>
            </div>

            {/* Conditional Display */}
            {infoType === "email" && (
              <div className="mt-3 text-sm text-gray-700">
                <strong>Emails:</strong>
                {Array.isArray(lead?.email) && lead.email.length > 1 ? (
                  <ul className="list-disc list-inside">
                    {lead.email.map((e: string, index: number) => (
                      <li key={index}>{e}</li>
                    ))}
                  </ul>
                ) : (
                  <span> {lead?.email || "N/A"}</span>
                )}
              </div>
            )}

            {infoType === "phone" && (
              <div className="mt-3 text-sm text-gray-700">
                <strong>Contact Number:</strong>{" "}
                {lead?.whatsUpNumber || lead?.phone || "N/A"}
              </div>
            )}

            {/* Lead Info */}
            {infoType === null && (
              <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center gap-6 border-b">
                    <button className="py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300">
                      Leads info
                    </button>
                  </div>
                <div>
                  <div className="text-gray-500">Email</div>
                  <div>
                    {Array.isArray(lead?.email) ? lead.email.join(", ") : lead?.email || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Phone</div>
                  <div>{lead?.whatsUpNumber || "N/A"}</div>
                </div>
                <div>
                  <div className="text-gray-500">Lead owner</div>
                  <div>{lead?.userId?.firstName || "N/A"}</div>
                </div>
                <div>
                  <div className="text-gray-500">Job Title</div>
                  <div>Content Writer</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Section */}
        <div className="md:col-span-2">
          {/* Search */}
          <div className="mb-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search activity, notes, email and more"
              className="h-10 pl-9"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white rounded-md border p-2 mb-4">
            {(
              ["activity", "notes", "emails", "calls", "task"] as const
            ).map((t) => (
              <button
                key={t}
                className={`px-3 py-2 rounded-md text-sm ${activeTab === t
                    ? "bg-gray-100 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
                onClick={() => setActiveTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "activity" && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <div>No activity yet</div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-4">
                {/* Add Note */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">Notes</h3>
                      <Button
                        onClick={() => {
                          setShowAddForm((prev) => {
                            const newValue = !prev;
                            if (newValue) {
                              setEditingNote(null);
                              setEditContent("");
                            }
                            return newValue;
                          });
                        }}
                        size="sm"
                        className="bg-[#E72125] hover:bg-[#c91c1f]"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                    {showAddForm && (
                      <div className="space-y-3">
                        <RichTextEditor
                          value={newNoteHtml}
                          onChange={setNewNoteHtml}
                          placeholder="Write your note here..."
                          minHeight={160}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleAddNote}
                            size="sm"
                            className="bg-[#E72125] hover:bg-[#c91c1f]"
                            disabled={!newNoteHtml.trim() && !newNote.trim()}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Note
                          </Button>

                          <Button
                            onClick={() => setShowAddForm(false)}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notes List */}
                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📝</div>
                      <div>No notes yet</div>
                      <div className="text-sm mt-2">
                        Click "Add Note" to create your first note
                      </div>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <Card
                        key={note._id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          {editingNote === note._id ? (
                            <div className="space-y-3">
                              <RichTextEditor
                                value={editContent}
                                onChange={setEditContent}
                                placeholder="Edit note..."
                                minHeight={140}
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleEditNote(note._id)}
                                  size="sm"
                                  className="bg-[#E72125] hover:bg-[#c91c1f]"
                                  disabled={!editContent.trim()}
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save
                                </Button>
                                <Button
                                  onClick={cancelEdit}
                                  variant="outline"
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div
                                    className="text-gray-800 prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{
                                      __html: note.content,
                                    }}
                                  />
                                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                    <span>
                                      {new Date(
                                        note.createdAt
                                      ).toLocaleString()}
                                    </span>
                                    <span>•</span>
                                    <span>{lead?.firstName || "Unknown"}</span>
                                    {note.updatedAt && (
                                      <>
                                        <span>•</span>
                                        <span>
                                          edited{" "}
                                          {new Date(
                                            note.updatedAt
                                          ).toLocaleString()}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    onClick={() => startEdit(note)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteNote(note._id)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
            {activeTab === "emails" && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📧</div>
                <div>No emails yet</div>
              </div>
            )}
            {activeTab === "calls" && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📞</div>
                <div>No calls yet</div>
              </div>
            )}
            {activeTab === "task" && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">✅</div>
                <div>No tasks yet</div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
