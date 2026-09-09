import React, { useEffect, useState } from "react";
import { api } from "../api.js";

function timeAgo(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Tabs({ tab, setTab }) {
  const tabs = [
    { id: "tea", label: "Tea identities" },
    { id: "users", label: "Users & roles" },
  ];
  return (
    <div className="flex gap-1 border-b border-ink/10 mb-6">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            tab === t.id
              ? "border-magenta text-magenta-dark"
              : "border-transparent text-newsgrey hover:text-ink"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function TeaAdminPanel() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  function refresh() {
    api.listTeaAdmin().then(setPosts).catch((e) => setError(e.message));
  }
  useEffect(refresh, []);

  async function handleDelete(id) {
    if (!confirm("Remove this tea post?")) return;
    await api.deleteTea(id);
    refresh();
  }
 
  return (
    <div>
      <p className="text-sm text-newsgrey mb-4">
        This view is admin-only. Everywhere else on the site, these posts show up
        with no name attached at all.
      </p>
      {error && <p className="text-magenta-dark text-sm mb-3">{error}</p>}
      <div className="overflow-x-auto bg-white border border-ink/10 rounded-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-newsgrey border-b border-ink/10">
              <th className="p-3 font-semibold">Post</th>
              <th className="p-3 font-semibold">Posted by</th>
              <th className="p-3 font-semibold">When</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-ink/5 last:border-0">
                <td className="p-3 max-w-md">{p.text}</td>
                <td className="p-3 font-semibold">
                  {p.author ? (
                    p.author.username
                  ) : (
                    <span className="text-newsgrey font-normal italic">
                      {p.poster_label}
                    </span>
                  )}
                </td>
                <td className="p-3 text-newsgrey">{timeAgo(p.created_at)}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-magenta-dark hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-newsgrey">
                  No tea posted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  function refresh() {
    api.listUsers().then(setUsers).catch((e) => setError(e.message));
  }
  useEffect(refresh, []);

  async function handleRoleChange(id, role) {
    try {
      await api.setUserRole(id, role);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      {error && <p className="text-magenta-dark text-sm mb-3">{error}</p>}
      <div className="overflow-x-auto bg-white border border-ink/10 rounded-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-newsgrey border-b border-ink/10">
              <th className="p-3 font-semibold">Username</th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Joined</th>
              <th className="p-3 font-semibold">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-ink/5 last:border-0">
                <td className="p-3 font-semibold">{u.username}</td>
                <td className="p-3 text-newsgrey">{u.email}</td>
                <td className="p-3 text-newsgrey">{timeAgo(u.created_at)}</td>
                <td className="p-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="border border-ink/15 rounded-md p-1.5 text-sm"
                  >
                    <option value="student">Student</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("tea");

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl font-bold mb-1">Admin</h1>
      <p className="text-newsgrey text-sm mb-6">
        Moderation tools. Handle with care.
      </p>
      <Tabs tab={tab} setTab={setTab} />
      {tab === "tea" ? <TeaAdminPanel /> : <UsersPanel />}
    </div>
  );
}