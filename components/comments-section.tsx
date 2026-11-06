"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight } from "lucide-react";
import { body, small, squareButton } from "@/app/(content)/_ui/public-styles";
import { cn } from "@/lib/utils";
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

/** Comment inputs: the design's field (44px, 8px radius, a hairline that darkens on hover and focus). */
const commentField =
  "h-auto min-h-11 rounded-sm border border-[color-mix(in_oklab,var(--fg)_20%,transparent)] bg-transparent px-3 font-body text-base md:text-base hover:border-[var(--muted)] focus-visible:border-foreground";

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

/** The API's `detail` message when it is a string (validation errors send a list), else the fallback. */
async function errorDetail(res: Response, fallback: string): Promise<string> {
  const body = (await res.json().catch(() => null)) as { detail?: unknown } | null;
  return typeof body?.detail === "string" ? body.detail : fallback;
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
        throw new Error(await errorDetail(res, "Failed to post reply"));
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
    <div className={depth > 0 ? "ml-6 md:ml-10" : undefined}>
      <div className="py-4">
        <p className={cn(small, "flex flex-wrap items-baseline gap-x-2 text-muted-foreground")}>
          <span className="text-[15px] font-medium text-foreground">{comment.author_name || "Anonymous"}</span>
          <span>{formatCommentDate(comment.created_at)}</span>
        </p>
        <p className="mt-1 whitespace-pre-wrap break-words text-[17px] leading-[1.6]">{comment.content}</p>

        <div className="mt-1 flex items-center gap-5 text-[14px] text-muted-foreground">
          <button
            type="button"
            onClick={() => setShowReplyForm(!showReplyForm)}
            aria-expanded={showReplyForm}
            className="min-h-9 transition-colors hover:text-foreground"
          >
            Reply
          </button>
          {hasReplies && (
            <button
              type="button"
              onClick={() => setShowReplies(!showReplies)}
              aria-expanded={showReplies}
              className="flex min-h-9 items-center gap-1 transition-colors hover:text-foreground"
            >
              <ChevronRight
                aria-hidden="true"
                className={`size-3.5 transition-transform ${showReplies ? "rotate-90" : ""}`}
              />
              {comment.replies!.length} {comment.replies!.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {showReplyForm && (
          <form onSubmit={handleReply} className="mt-3 grid max-w-[34em] gap-3">
            {!isAuthenticated && (
              <Input
                placeholder="Your name (optional)"
                aria-label="Your name (optional)"
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                disabled={submitting}
                className={commentField}
              />
            )}
            <Textarea
              placeholder="Write a reply"
              aria-label="Reply"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              disabled={submitting}
              rows={2}
              className={cn(commentField, "resize-none py-3")}
              autoFocus
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                aria-busy={submitting}
                className={squareButton("solid", "small")}
              >
                {submitting ? "Posting" : "Post reply"}
              </button>
              <button
                type="button"
                className={squareButton("quiet", "small")}
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {hasReplies && showReplies && (
        <div>
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a new slug (group tab switch) must not show the previous file's comments while this one loads
    setLoading(true);
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
        throw new Error(await errorDetail(res, "Failed to post comment"));
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
    <section aria-labelledby="comments-title" className="grid max-w-[720px] gap-6">
      <h2 id="comments-title" className="text-[clamp(24px,1.3rem+1.1vw,36px)] leading-[1.15] tracking-[-0.015em]">
        Comments
        {total > 0 && <span className="text-muted-foreground"> ({total})</span>}
      </h2>

      <form onSubmit={handleSubmit} className="grid gap-3">
        {!isAuthenticated && (
          <Input
            placeholder="Your name (optional)"
            aria-label="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            className={commentField}
          />
        )}
        <Textarea
          placeholder={isAuthenticated ? "Write a comment" : "Write a comment as a guest"}
          aria-label="Comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={submitting}
          rows={3}
          className={cn(commentField, "resize-none py-3")}
        />
        <div>
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            aria-busy={submitting}
            className={squareButton("solid", "small")}
          >
            {submitting ? "Posting" : "Post comment"}
          </button>
        </div>
      </form>

      {loading ? (
        <p role="status" className={cn(body, "text-muted-foreground")}>
          Loading comments
        </p>
      ) : commentTree.length === 0 ? (
        <p className={cn(body, "text-muted-foreground")}>No comments yet.</p>
      ) : (
        <div>
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
            <button
              type="button"
              className={cn(squareButton("quiet", "small"), "mt-4")}
              onClick={() => {
                setLoadingMore(true);
                fetchComments(page + 1, true);
              }}
              disabled={loadingMore}
              aria-busy={loadingMore}
            >
              {loadingMore ? "Loading" : "Load more comments"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
