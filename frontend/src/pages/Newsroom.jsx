import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { formatDate } from "../components/StoryCard.jsx";

const EMPTY_FORM = {
  title: "",
  category: "Announcement",
  summary: "",
  body: "",
  image_url: "",
  featured: false,
};

export default function Newsroom() {
  const [stories, setStories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    api.listStories().then(setStories).catch((e) => setError(e.message));
  }

  useEffect(refresh, []);

  function startEdit(story) {
    setEditingId(story.id);
    setForm({
      title: story.title,
      category: story.category,
      summary: story.summary,
      body: story.body,
      image_url: story.image_url,
      featured: story.featured,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (editingId) {
        await api.updateStory(editingId, form);
      } else {
        await api.createStory(form);
      }
      resetForm();
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this story? This can't be undone.")) return;
    try {
      await api.deleteStory(id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl font-bold mb-1">Newsroom</h1>
      <p className="text-newsgrey text-sm mb-8">Write, publish, and manage stories.</p>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-ink/10 rounded-lg p-6 mb-10 flex flex-col gap-4"
      >
        <h2 className="font-display text-xl font-semibold">
          {editingId ? "Edit story" : "New story"}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full border border-ink/15 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-ink/15 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40"
            >
              <option>Announcement</option>
              <option>Sports</option>
              <option>Arts</option>
              <option>Academics</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Image URL (optional)</label>
          <input
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="https://…"
            className="w-full border border-ink/15 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40"
          />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Summary</label>
          <input
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            maxLength={500}
            className="w-full border border-ink/15 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40"
          />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Story body</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={6}
            required
            className="w-full border border-ink/15 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Feature this on the front page
        </label>

        {error && <p className="text-magenta-dark text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-magenta hover:bg-magenta-dark transition-colors text-white font-semibold px-5 py-2.5 rounded-md disabled:opacity-50"
          >
            {editingId ? "Save changes" : "Publish story"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-newsgrey hover:text-ink"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <h2 className="font-display text-xl font-semibold mb-4">Published stories</h2>
      <div className="space-y-3">
        {stories.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-ink/10 rounded-md p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold">{s.title}</p>
              <p className="text-xs text-newsgrey">
                {s.category} · {formatDate(s.created_at)}
                {s.featured && " · Featured"}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => startEdit(s)}
                className="text-sm text-ink hover:text-magenta-dark font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="text-sm text-magenta-dark hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}