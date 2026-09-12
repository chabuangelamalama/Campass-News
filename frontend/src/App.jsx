import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import StoryDetail from "./pages/StoryDetail.jsx";
import Tea from "./pages/Tea.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Newsroom from "./pages/Newsroom.jsx";
import Admin from "./pages/Admin.jsx";
import SubmitStory from "./pages/SubmitStory.jsx";
import Moderation from "./pages/Moderation.jsx";
import Yearbook from "./pages/Yearbook.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stories/:id" element={<StoryDetail />} />
          <Route path="/tea" element={<Tea />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/submit-story" element={<ProtectedRoute><SubmitStory /></ProtectedRoute>} />
          <Route path="/moderation" element={<ProtectedRoute requireRole="editor"><Moderation /></ProtectedRoute>} />
          <Route path="/yearbook" element={<ProtectedRoute><Yearbook /></ProtectedRoute>} />
        
          <Route
            path="/newsroom"
            element={
              <ProtectedRoute requireRole="editor">
                <Newsroom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />

      </Routes>
      </main>
      <footer className="bg-ink text-paper/70 text-center py-6 text-sm mt-auto">
        © 2026 The Campus Line. All rights reserved.
      </footer>
    </div>
  );
}