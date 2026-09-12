import React, { useState } from "react";

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "./NotificationBell.jsx";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-sm tracking-wide transition-colors ${
          isActive ? "text-magenta" : "text-paper/80 hover:text-paper"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout, isEditor, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-ink text-paper sticky top-0 z-40 shadow-lg">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-baseline gap-2 shrink-0">
          <span className="font-display italic text-2xl md:text-3xl font-semibold">
            The Campus Line
          </span>
          <span className="hidden sm:inline text-[11px] text-gold font-body font-semibold">
            est. this term
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavItem to="/">Front Page</NavItem>
          <NavItem to="/tea"> Tea Wall </NavItem>
          {user && <NavItem to="/submit-story">Submit Story</NavItem>}
          {isEditor && <NavItem to="/moderation">Moderation</NavItem>}
          {user && <NavItem to="/yearbook">Yearbook</NavItem>}
          {isEditor && <NavItem to="/newsroom">Newsroom</NavItem>}
          {isAdmin && <NavItem to="/admin">Admin</NavItem>}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-paper/70">
                Signed in as <span className="text-paper font-semibold">{user.username}</span>
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-sm bg-magenta hover:bg-magenta-dark transition-colors px-3 py-1.5 rounded"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-paper/80 hover:text-paper">
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm bg-magenta hover:bg-magenta-dark transition-colors px-3 py-1.5 rounded"
              >
                Join up
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-paper text-2xl leading-none"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? "×" : "≡"}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-paper/10 px-5 py-4 flex flex-col gap-3">
          <NavItem to="/" >Front Page</NavItem>
          <NavItem to="/tea">Tea Wall</NavItem>
          {isEditor && <NavItem to="/newsroom">Newsroom</NavItem>}
          {isAdmin && <NavItem to="/admin">Admin</NavItem>}
          <div className="h-px bg-paper/10 my-1" />
          {user ? (
            <button
              onClick={() => {
                logout();
                navigate("/");
                setOpen(false);
              }}
              className="text-left text-sm text-magenta"
            >
              Log out ({user.username})
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm">
                Log in
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="text-sm text-gold">
                Join up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}