import React from "react";
import ReactionBar from "./ReactionBar.jsx";

const ROTATIONS = ["rotate-note-1", "rotate-note-2", "rotate-note-3", "rotate-note-4"];

function timeAgo(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TeaCard({ post, index, adminLabel, onDelete }) {
  const rotation = ROTATIONS[index % ROTATIONS.length];
  return (
    <div
      className={`bg-[#FFFBEA] border border-ink/10 rounded-sm p-5 shadow-[0_6px_14px_rgba(0,0,0,0.08)] ${rotation} relative`}
    >
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-magenta shadow" />
      <div className="flex items-center justify-between text-xs font-semibold text-magenta-dark mb-2">
        <span>🕵️ Anonymous</span>
        <span className="text-newsgrey font-normal">{timeAgo(post.created_at)}</span>
      </div>
      
      <p className="font-display italic text-ink/90 leading-snug">"{post.text}"</p>
      <ReactionBar targetType="tea" targetId={post.id} />
      {adminLabel && (
        <p className="mt-3 text-xs bg-ink text-paper inline-block px-2 py-1 rounded">
          Posted by: {adminLabel}
        </p>
      )}

      {onDelete && (
        <button
          onClick={onDelete}
          className="mt-3 block text-xs text-magenta-dark hover:underline"
        >
          🗑️ Remove post
        </button>
      )}
    </div>
  );
}