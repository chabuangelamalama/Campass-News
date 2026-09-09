import React from "react";
import { Link } from "react-router-dom";

const CATEGORY_STYLES = {
  Announcement: "bg-lilac text-magenta-dark",
  Sports: "bg-[#E7F6EC] text-[#1F8A4C]",
  Arts: "bg-[#F3E8FF] text-[#7C3AED]",
  Academics: "bg-[#FFF1D6] text-[#B8790B]",
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CategoryTag({ category }) {
  const style = CATEGORY_STYLES[category] || "bg-lilac text-magenta-dark";
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded ${style}`}>
      {category}
    </span>
  );
}

export default function StoryCard({ story }) {
  return (
    <Link
      to={`/stories/${story.id}`}
      className="group block bg-white rounded-md border border-ink/10 overflow-hidden hover:border-magenta/40 hover:shadow-md transition-all"
    >
      {story.image_url ? (
        <img
          src={story.image_url}
          alt={story.title}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-2 bg-gradient-to-r from-magenta to-gold" />
      )}
      <div className="p-4">
        <CategoryTag category={story.category} />
        <h3 className="font-display text-xl font-semibold mt-2 leading-snug group-hover:text-magenta-dark transition-colors">
          {story.title}
        </h3>
        <p className="text-sm text-newsgrey mt-1">{formatDate(story.created_at)}</p>
        {story.summary && (
          <p className="text-sm text-ink/80 mt-2 line-clamp-2">{story.summary}</p>
        )}
        <p className="text-xs text-newsgrey mt-3">
          {story.comment_count} {story.comment_count === 1 ? "comment" : "comments"}
        </p>
      </div>
    </Link>
  );
}

export { formatDate };