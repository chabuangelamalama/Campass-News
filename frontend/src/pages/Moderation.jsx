import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { formatDate } from "../components/StoryCard.jsx";

export default function Moderation() {
  const [pending, setPending] = useState([]);
  const [error, setError] = useState("");

  function refresh() {
    api.listPendingStories().then(setPending).catch((e) => setError(e.message));
  }
  useEffect(refresh, []);

  async function decide(id, status) {
    try {
      await api.setStoryStatus(id, status);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl font-bold mb-1">Moderation queue</h1>
      <p className="text-newsgrey text-sm mb-8">Student-submitted stories waiting for review.</p>
      {error && <p className="text-magenta-dark text-sm mb-4">{error}</p>}
      {pending.length === 0 ? (
        <p className="text-newsgrey">Nothing waiting for review.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((s) => (
            <div key={s.id} className="bg-white border border-ink/10 rounded-md p-4">
              <p className="font-semibold">{s.title}</p>
              <p className="text-xs text-newsgrey">{s.category} · {formatDate(s.created_at)} · by {s.author?.username}</p>
              <p className="text-sm text-ink/80 mt-2 line-clamp-2">{s.summary || s.body}</p>
              <div className="flex gap-3 mt-3">
                <button onClick={() => decide(s.id, "published")}
                  className="text-sm bg-magenta hover:bg-magenta-dark text-white font-semibold px-3 py-1.5 rounded-md">
                  Approve
                </button>
                <button onClick={() => decide(s.id, "rejected")}
                  className="text-sm border border-ink/15 hover:border-magenta text-ink px-3 py-1.5 rounded-md">
                  Reject
                </button>
                <Link to={`/stories/${s.id}`} className="text-sm text-newsgrey self-center ml-auto">Preview →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}