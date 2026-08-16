"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { authFetch } from "@/lib/api-client";
import { Plus, X, Pencil } from "lucide-react";
import type { Tag } from "@/types/share";

const TAG_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
  "#f43f5e", "#84cc16", "#14b8a6", "#0ea5e9", "#d946ef",
];

interface TagManagerProps {
  shareId?: string;
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
}

export function TagManager({ shareId, selectedTagIds, onTagsChange }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const fetchTags = useCallback(async () => {
    try {
      const res = await authFetch("/api/dashboard/tags");
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical fetch-on-mount; setStates only run after await inside fetchTags
  useEffect(() => { fetchTags(); }, [fetchTags]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const res = await authFetch("/api/dashboard/tags", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      });
      if (res.ok) {
        setNewName("");
        setShowCreate(false);
        fetchTags();
      } else if (res.status === 409) {
        alert("Tag with this name already exists");
      }
    } catch {
      alert("Failed to create tag");
    }
  };

  const handleUpdate = async () => {
    if (!editingTag || !editName.trim()) return;
    try {
      const res = await authFetch(`/api/dashboard/tags/${editingTag.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: editName.trim(), color: editColor }),
      });
      if (res.ok) {
        setEditingTag(null);
        fetchTags();
      }
    } catch {
      alert("Failed to update tag");
    }
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`Delete tag "${tag.name}"? It will be removed from all shares.`)) return;
    try {
      const res = await authFetch(`/api/dashboard/tags/${tag.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // Also remove from selection
        onTagsChange(selectedTagIds.filter((id) => id !== tag.id));
        fetchTags();
      }
    } catch {
      alert("Failed to delete tag");
    }
  };

  const toggleTag = (tagId: string) => {
    const newIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];
    onTagsChange(newIds);
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading tags...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Tags</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setShowCreate(true)}
          title="Create tag"
        >
          <Plus className="size-3" />
        </Button>
      </div>

      {tags.length === 0 && !showCreate ? (
        <p className="text-sm text-muted-foreground">
          No tags yet.{" "}
          <button
            onClick={() => setShowCreate(true)}
            className="text-primary hover:underline"
          >
            Create one
          </button>
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <div key={tag.id} className="group relative inline-flex items-center">
                <button
                  onClick={() => toggleTag(tag.id)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                  style={isSelected ? { borderColor: tag.color } : undefined}
                >
                  <span
                    className="size-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                  {tag.share_count != null && tag.share_count > 0 && (
                    <span className="text-[10px] opacity-60">
                      {tag.share_count}
                    </span>
                  )}
                </button>

                {/* Hover actions */}
                <div className="hidden group-hover:flex absolute -top-1 -right-1 gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTag(tag);
                      setEditName(tag.name);
                      setEditColor(tag.color ?? "");
                    }}
                    className="size-4 rounded-full bg-background border border-border flex items-center justify-center hover:bg-muted"
                    title="Edit tag"
                  >
                    <Pencil className="size-2" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(tag);
                    }}
                    className="size-4 rounded-full bg-background border border-border flex items-center justify-center hover:bg-destructive/10 text-destructive"
                    title="Delete tag"
                  >
                    <X className="size-2" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      {showCreate && (
        <Dialog open onOpenChange={(o) => { if (!o) setShowCreate(false); }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Create Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Tag name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <div className="flex flex-wrap gap-1.5">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={`size-6 rounded-full border-2 transition-all ${
                      newColor === color
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!newName.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit dialog */}
      {editingTag && (
        <Dialog open onOpenChange={(o) => { if (!o) setEditingTag(null); }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Tag name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                autoFocus
              />
              <div className="flex flex-wrap gap-1.5">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setEditColor(color)}
                    className={`size-6 rounded-full border-2 transition-all ${
                      editColor === color
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditingTag(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={!editName.trim()}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
