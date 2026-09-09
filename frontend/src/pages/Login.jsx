import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="font-display text-3xl font-bold mb-1">Welcome back</h1>
      <p className="text-newsgrey text-sm mb-8">Log in to comment and post.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold block mb-1">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border border-ink/15 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40"
          />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-ink/15 rounded-md p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-magenta/40"
          />
        </div>
        {error && <p className="text-magenta-dark text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-paper font-semibold py-2.5 rounded-md hover:bg-magenta-dark transition-colors disabled:opacity-50"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-sm text-newsgrey mt-6">
        New here?{" "}
        <Link to="/signup" className="text-magenta font-semibold">
          Create an account
        </Link>
      </p>
    </div>
  );
}