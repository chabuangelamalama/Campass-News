import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Yearbook() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [entries, setEntries] = useState([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listYearbookYears().then((ys) => setYears(ys.length ? ys : [currentYear])).catch(() => setYears([currentYear]));
  }, []);

  function refresh(year) {
    api.listYearbookEntries(year).then(setEntries).catch((e) => setError(e.message));
  }
  useEffect(() => { refresh(selectedYear); }, [selectedYear]);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await api.uploadYearbookEntry(selectedYear, caption, file);
      setCaption(""); setFile(null); setPreview(null);
      refresh(selectedYear);
      if (!years.includes(selectedYear)) setYears([selectedYear, ...years]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this photo?")) return;
    await api.deleteYearbookEntry(id);
    refresh(selectedYear);
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-5 py-16 text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Digital Yearbook</h1>
        <p className="text-newsgrey">Log in to view and add photos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl font-bold mb-1">Digital Yearbook</h1>
      <p className="text-newsgrey text-sm mb-6">Only signed-in students can view or add photos.</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {[...new Set([selectedYear, ...years])].sort((a, b) => b - a).map((y) => (
          <button key={y} onClick={() => setSelectedYear(y)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
              y === selectedYear ? "bg-ink text-paper border-ink" : "border-ink/15 text-ink hover:border-ink/40"
            }`}>
            {y}
          </button>
        ))}
      </div>

      <form onSubmit={handleUpload} className="bg-white border border-ink/10 rounded-lg p-5 mb-10 flex flex-col gap-3 max-w-md">
        <h2 className="font-display text-lg font-semibold">Add a photo to {selectedYear}</h2>
        <input type="file" accept="image/*" onChange={handleFile}
          className="text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-lilac file:text-magenta-dark file:font-semibold" />
        {preview && <img src={preview} alt="Preview" className="h-32 rounded-md object-cover" />}
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)"
          className="border border-ink/15 rounded-md p-2 text-sm" />
        {error && <p className="text-magenta-dark text-sm">{error}</p>}
        <button type="submit" disabled={!file || uploading}
          className="bg-magenta hover:bg-magenta-dark text-white font-semibold py-2 rounded-md disabled:opacity-50">
          {uploading ? "Uploading…" : "Add photo"}
        </button>
      </form>

      {entries.length === 0 ? (
        <p className="text-newsgrey">No photos for {selectedYear} yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white border border-ink/10 rounded-md overflow-hidden">
              <img src={entry.image_url} alt={entry.caption} className="w-full h-48 object-cover" />
              <div className="p-3">
                {entry.caption && <p className="text-sm">{entry.caption}</p>}
                <p className="text-xs text-newsgrey mt-1">by {entry.author.username}</p>
                {(user.id === entry.author.id || user.role === "admin") && (
                  <button onClick={() => handleDelete(entry.id)} className="text-xs text-magenta-dark hover:underline mt-1">
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}