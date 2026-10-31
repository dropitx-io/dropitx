"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Loader2,
  Send,
  ChevronDown,
  User,
  Reply,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { getApiUrl, getAuthHeaders } from "@/lib/api-client";

interface Comment {
  id: string;
  author_name: string | null;
  content: string;
  created_at: string;
  user_id: string | null;
  parent_id: string | null;
  replies?: Comment[];
}

interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  per_page: number;
}

interface CommentsSectionProps {
  slug: string;
  isAuthenticated: boolean;
}

function formatCommentDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Build a tree structure from flat comments array.
 * Comments with parent_id are nested under their parent.
 */
function buildCommentTree(comments: Comment[]): Comment[] {
  const map = new Map<string, Comment>();
  const roots: Comment[] = [];

  // First pass: index all comments
  for (const comment of comments) {
    map.set(comment.id, { ...comment, replies: [] });
  }

  // Second pass: assign children to parents
  for (const comment of comments) {
    const node = map.get(comment.id)!;
    if (comment.parent_id && map.has(comment.parent_id)) {
      const parent = map.get(comment.parent_id)!;
      parent.replies = parent.replies || [];
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/** Count all comments including nested replies */
function countAllComments(comments: Comment[]): number {
  let count = 0;
  for (const c of comments) {
    count += 1;
    if (c.replies && c.replies.length > 0) {
      count += countAllComments(c.replies);
    }
  }
  return count;
}

interface CommentItemProps {
  comment: Comment;
  depth: number;
  isAuthenticated: boolean;
  slug: string;
  onReplyPosted: (newComment: Comment) => void;
}

function CommentItem({
  comment,
  depth,
  isAuthenticated,
  slug,
  onReplyPosted,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyName, setReplyName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < 2); // Auto-expand first 2 levels

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const authHeaders = await getAuthHeaders();
      const body: Record<string, string> = {
        content: replyContent.trim(),
        parent_id: comment.id,
      };
      if (!isAuthenticated && replyName.trim()) body.author_name = replyName.trim();

      const res = await fetch(getApiUrl(`/api/shares/${encodeURIComponent(slug)}/comments`), {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to post reply" }));
        throw new Error(err.error || "Failed to post reply");
      }

      const newComment: Comment = await res.json();
      onReplyPosted(newComment);
      setReplyContent("");
      setReplyName("");
      setShowReplyForm(false);
      setShowReplies(true);
      toast.success("Reply posted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l-2 border-border/40" : ""}>
      <div className="flex gap-3 rounded-lg p-3 hover:bg-muted/30 transition-colors">
        <div className="shrink-0 size-8 rounded-full bg-muted flex items-center justify-center">
          <User className="size-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {comment.author_name || "Anonymous"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatCommentDate(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* Reply actions */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="size-3" />
              Reply
            </button>
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight
                  className={`size-3 transition-transform ${showReplies ? "rotate-90" : ""}`}
                />
                {comment.replies!.length} {comment.replies!.length === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>

          {/* Inline reply form */}
          {showReplyForm && (
            <form onSubmit={handleReply} className="mt-3 space-y-2">
              {!isAuthenticated && (
                <Input
                  placeholder="Your name (optional)"
                  value={replyName}
                  onChange={(e) => setReplyName(e.target.value)}
                  disabled={submitting}
                  className="h-8 text-sm"
                />
              )}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  disabled={submitting}
                  rows={2}
                  className="resize-none text-sm"
                  autoFocus
                />
                <div className="flex flex-col gap-1">
                  <Button
                    type="submit"
                    size="icon"
                    disabled={submitting || !replyContent.trim()}
                    className="shrink-0 size-8"
                  >
                    {submitting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {hasReplies && showReplies && (
        <div className="space-y-0">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              isAuthenticated={isAuthenticated}
              slug={slug}
              onReplyPosted={onReplyPosted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentsSection({ slug, isAuthenticated }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const perPage = 20;

  const fetchComments = useCallback(
    async (pageNum: number, append = false) => {
      try {
        const authHeaders = await getAuthHeaders();
        const url = getApiUrl(`/api/shares/${encodeURIComponent(slug)}/comments?page=${pageNum}&per_page=${perPage}`);
        const res = await fetch(url, { headers: authHeaders });

        if (!res.ok) {
          if (!append) setComments([]);
          return;
        }

        const data: CommentsResponse = await res.json();
        setComments((prev) => (append ? [...prev, ...data.comments] : data.comments));
        setTotal(data.total);
        setPage(data.page);
      } catch {
        if (!append) setComments([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical fetch-on-mount; setStates only run after await inside fetchComments
    fetchComments(1);
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const authHeaders = await getAuthHeaders();
      const body: Record<string, string> = { content: content.trim() };
      if (!isAuthenticated && name.trim()) body.author_name = name.trim();

      const res = await fetch(getApiUrl(`/api/shares/${encodeURIComponent(slug)}/comments`), {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to post comment" }));
        throw new Error(err.error || "Failed to post comment");
      }

      const newComment: Comment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setTotal((prev) => prev + 1);
      setContent("");
      setName("");
      toast.success("Comment posted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  /** Handle a new reply: inject it into the tree */
  const handleReplyPosted = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
    setTotal((prev) => prev + 1);
  };

  const hasMore = comments.length < total;
  const commentTree = buildCommentTree(comments);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-4" />
          Comments
          {total > 0 && (
            <Badge variant="secondary" className="text-xs font-normal px-1.5 py-0 h-5">
              {total}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isAuthenticated && (
            <Input
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              className="h-9"
            />
          )}
          <div className="flex gap-2">
            <Textarea
              placeholder={isAuthenticated ? "Write a comment..." : "Write a comment as guest..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              rows={2}
              className="resize-none text-sm"
            />
            <Button
              type="submit"
              size="icon"
              disabled={submitting || !content.trim()}
              className="shrink-0 self-end"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </form>

        {/* Comment list */}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : commentTree.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first!
          </p>
        ) : (
          <div className="space-y-1">
            {commentTree.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                depth={0}
                isAuthenticated={isAuthenticated}
                  slug={slug}
                onReplyPosted={handleReplyPosted}
              />
            ))}

            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1"
                onClick={() => {
                  setLoadingMore(true);
                  fetchComments(page + 1, true);
                }}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
                Load more comments
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
