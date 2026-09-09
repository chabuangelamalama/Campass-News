import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import TeaCard from "../components/TeaCard.jsx";

export default function Tea() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function refresh() {
    api
      .listTea()
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await api.postTea(text.trim());
      setText("");
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold">☕ The Tea Wall</h1>
        <p className="text-newsgrey mt-2 max-w-xl mx-auto">
          Spill it. Every post here shows up completely anonymous — no name, no
          username, nothing. Keep it fun, keep it kind-ish.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border-2 border-dashed border-magenta/40 rounded-lg p-6 max-w-xl mx-auto mb-12"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Type your anonymous tip here…"
          className="w-full border border-ink/15 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-magenta/40"
        />
        {error && <p className="text-magenta-dark text-sm mt-2">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-3 w-full bg-magenta hover:bg-magenta-dark transition-colors text-white font-semibold py-2.5 rounded-md disabled:opacity-50"
        >
          {submitting ? "Sending…" : "Submit anonymously ☕"}
        </button>
        <p className="text-xs text-newsgrey mt-2 text-center">
          {user
            ? "You're logged in, but your post still appears fully anonymous to everyone."
            : "Posting without an account works too."}
        </p>
      </form>

      {loading ? (
        <p className="text-center text-newsgrey">Loading the wall…</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-newsgrey">
          The wall is empty… be the first to spill some tea! 🤫
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {posts.map((post, i) => (
            <TeaCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}