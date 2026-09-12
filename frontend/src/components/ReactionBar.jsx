import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const EMOJIS = ["🔥", "😂", "❤️", "😮", "👏", "👍🏽", "👍🏻", "👎🏽","👎🏻", "🥹", "👀", "☕", "🫖"];

export default function ReactionBar({ targetType, targetId }) {
  const { user } = useAuth();
  const [data, setData] = useState({ counts: {}, my_reaction: null });

  useEffect(() => {
    api.getReactions(targetType, targetId).then(setData).catch(() => {});
  }, [targetType, targetId]);

  async function react(emoji) {
    if (!user) return;
    const result = await api.setReaction(targetType, targetId, emoji);
    setData(result);
  }

  return (
  <div className="flex flex-wrap gap-1 mt-2 max-w-full">
    {EMOJIS.map((emoji) => (
      <button
        key={emoji}
        onClick={() => react(emoji)}
        disabled={!user}
        className={`text-xs px-1.5 py-0.5 rounded-full border transition-colors shrink-0 ${
          data.my_reaction === emoji
            ? "bg-magenta/10 border-magenta"
            : "border-ink/10 hover:border-ink/30"
        } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {emoji} {data.counts[emoji] || ""}
      </button>
    ))}
  </div>
);
}