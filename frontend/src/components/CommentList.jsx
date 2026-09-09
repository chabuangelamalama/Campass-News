import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";

function timeAgo(iso) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CommentList({ storyId, comments, setComments }) {
  const { user, isAdmin } = useAuth();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const comment = await api.createComment(storyId, text.trim());
      setComments((prev) => [...prev, comment]);
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mt-10">
      <h3 className="font-display text-xl font-semibold mb-4">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h3>

      <div className="space-y-4 mb-6">
        {comments.map((c) => (
          <div key={c.id} className="bg-white border border-ink/10 rounded-md p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{c.author.username}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-newsgrey">{timeAgo(c.created_at)}</span>
                {user && (user.id === c.author.id || isAdmin) && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-xs text-magenta-dark hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            <p className="text-ink/90 mt-1.5">{c.body}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-newsgrey text-sm">No comments yet — be the first to weigh in.</p>
        )}
      </div>

      {error && <p className="text-magenta-dark text-sm mb-3">{error}</p>}

      {user ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Add to the conversation…"
            className="w-full border border-ink/15 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40"
          />
          <button
            type="submit"
            disabled={submitting}
            className="self-end bg-ink text-paper text-sm font-semibold px-4 py-2 rounded-md hover:bg-magenta-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Post comment"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-newsgrey">
          <a href="/login" className="text-magenta font-semibold">
            Log in
          </a>{" "}
          to join the conversation.
        </p>
      )}
    </div>
  );
}