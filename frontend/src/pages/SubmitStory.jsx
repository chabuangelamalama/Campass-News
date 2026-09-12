import React, { useState } from "react";
import { api } from "../api.js";
import ImageUploadField from "../components/ImageUploadField.jsx";

export default function SubmitStory() {
  const [form, setForm] = useState({ title: "", category: "Announcement", summary: "", body: "", image_url: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.createStory(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16 text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Submitted!</h1>
        <p className="text-newsgrey">Your story is in the queue for review. You'll get a notification once it's published.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl font-bold mb-1">Submit a story</h1>
      <p className="text-newsgrey text-sm mb-8">An editor will review it before it goes live.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-lg p-6 flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold block mb-1">Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
            className="w-full border border-ink/15 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-ink/15 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40">
            <option>Announcement</option>
            <option>Sports</option>
            <option>Arts</option>
            <option>Academics</option>
          </select>
        </div>
        <ImageUploadField label="Photo (optional)" onUploaded={(url) => setForm({ ...form, image_url: url })} />
        <div>
          <label className="text-sm font-semibold block mb-1">Summary</label>
          <input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} maxLength={500}
            className="w-full border border-ink/15 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40" />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Story</label>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} required
            className="w-full border border-ink/15 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40" />
        </div>
        {error && <p className="text-magenta-dark text-sm">{error}</p>}
        <button type="submit" disabled={submitting}
          className="bg-magenta hover:bg-magenta-dark transition-colors text-white font-semibold px-5 py-2.5 rounded-md disabled:opacity-50">
          {submitting ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </div>
  );
}