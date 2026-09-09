import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, requireRole }) {
  const { user, loading, isEditor, isAdmin } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (requireRole === "admin" && !isAdmin) return <Navigate to="/" replace />;
  if (requireRole === "editor" && !isEditor) return <Navigate to="/" replace />;

  return children;
}