import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import StoryCard, { CategoryTag, formatDate } from "../components/StoryCard.jsx";

export default function Home() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listStories()
      .then(setStories)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-5 py-16 text-newsgrey">Loading the front page…</div>;
  }
  if (error) {
    return <div className="max-w-6xl mx-auto px-5 py-16 text-magenta-dark">{error}</div>;
  }

  const featured = stories.find((s) => s.featured) || stories[0];
  const rest = stories.filter((s) => s.id !== featured?.id);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      {featured && (
        <Link
          to={`/stories/${featured.id}`}
          className="group grid md:grid-cols-2 gap-0 bg-white rounded-lg border border-ink/10 overflow-hidden mb-12 hover:shadow-xl transition-shadow relative"
        >
          <div className="absolute top-4 right-4 z-10 bg-gold text-ink text-xs font-bold px-3 py-1 rounded-full rotate-note-2 shadow">
            Exclusive
          </div>
          {featured.image_url ? (
            <img
              src={featured.image_url}
              alt={featured.title}
              className="w-full h-64 md:h-full object-cover"
            />
          ) : (
            <div className="w-full h-64 md:h-full bg-gradient-to-br from-ink to-magenta-dark" />
          )}
          <div className="p-8 flex flex-col justify-center gap-3">
            <CategoryTag category={featured.category} />
            <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight group-hover:text-magenta-dark transition-colors">
              {featured.title}
            </h1>
            <p className="text-sm text-newsgrey">{formatDate(featured.created_at)}</p>
            <p className="text-ink/80">{featured.summary}</p>
            <span className="text-magenta font-semibold text-sm mt-2">
              Read the full story →
            </span>
          </div>
        </Link>
      )}

      <div className="flex items-baseline justify-between mb-5">
        <h2 className="font-display text-2xl font-semibold">Also making the rounds</h2>
      </div>

      {rest.length === 0 ? (
        <p className="text-newsgrey">No other stories yet — check back soon.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}