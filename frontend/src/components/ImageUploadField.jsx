import React, { useState } from "react";
import { api } from "../api.js";

export default function ImageUploadField({ label, onUploaded }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setError("");
    try {
      const url = await api.uploadImage(file);
      onUploaded(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-sm font-semibold block mb-1">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-lilac file:text-magenta-dark file:font-semibold file:text-sm"
      />
      {uploading && <p className="text-xs text-newsgrey mt-1">Uploading…</p>}
      {error && <p className="text-xs text-magenta-dark mt-1">{error}</p>}
      {preview && !uploading && (
        <img src={preview} alt="Preview" className="mt-2 h-32 rounded-md object-cover" />
      )}
    </div>
  );
}