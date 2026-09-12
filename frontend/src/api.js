const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("campusnews_token");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // no body
  }

  if (!res.ok) {
    const message = data?.detail || "Something went wrong. Please try again.";
    throw new Error(typeof message === "string" ? message : "Request failed.");
  }
  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me", { auth: true }),

  listStories: (category) =>
    request(`/stories${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  getStory: (id) => request(`/stories/${id}`),
  createStory: (payload) => request("/stories", { method: "POST", body: payload, auth: true }),
  updateStory: (id, payload) => request(`/stories/${id}`, { method: "PUT", body: payload, auth: true }),
  deleteStory: (id) => request(`/stories/${id}`, { method: "DELETE", auth: true }),

  listComments: (storyId) => request(`/stories/${storyId}/comments`),
  createComment: (storyId, body) =>
    request(`/stories/${storyId}/comments`, { method: "POST", body: { body }, auth: true }),
  deleteComment: (id) => request(`/comments/${id}`, { method: "DELETE", auth: true }),

  listTea: () => request("/tea"),
  postTea: (text) => request("/tea", { method: "POST", body: { text }, auth: true }),
  listTeaAdmin: () => request("/tea/admin", { auth: true }),
  deleteTea: (id) => request(`/tea/${id}`, { method: "DELETE", auth: true }),

  listUsers: () => request("/users", { auth: true }),
  setUserRole: (id, role) => request(`/users/${id}/role`, { method: "PUT", body: { role }, auth: true }),

  getReactions: (targetType, targetId) => request(`/reactions?target_type=${targetType}&target_id=${targetId}`),
  setReaction: (targetType, targetId, emoji) => request("/reactions", { method: "POST", body: { target_type: targetType, target_id: targetId, emoji }, auth: true }),

  listNotifications: () => request("/notifications", { auth: true }),
 unreadCount: () => request("/notifications/unread-count", { auth: true }),
 markAllRead: () => request("/notifications/read-all", { method: "PUT", auth: true }),

 uploadImage: async (file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${API_BASE}/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || "Upload failed.");
  return data.url;
},


listPendingStories: () => request("/stories/pending", { auth: true }),
setStoryStatus: (id, status) => request(`/stories/${id}/status`, { method: "PUT", body: { status }, auth: true }),
listTrending: () => request("/stories/trending/list"),

listYearbookYears: () => request("/yearbook/years/list", { auth: true }),
listYearbookEntries: (year) => request(`/yearbook/${year}`, { auth: true }),
uploadYearbookEntry: async (year, caption, file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append("year", year);
  formData.append("caption", caption);
  formData.append("image", file);
  const res = await fetch(`${API_BASE}/yearbook`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || "Upload failed.");
  return data;
},
deleteYearbookEntry: (id) => request(`/yearbook/${id}`, { method: "DELETE", auth: true }),

};

export { getToken };