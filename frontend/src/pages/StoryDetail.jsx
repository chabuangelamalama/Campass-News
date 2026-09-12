import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { CategoryTag, formatDate } from "../components/StoryCard.jsx";
import CommentList from "../components/CommentList.jsx";
import ReactionBar from "../components/ReactionBar.jsx";

export default function StoryDetail() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    Promise.all([api.getStory(id), api.listComments(id)])
      .then(([s, c]) => {
        setStory(s);
        setComments(c);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-16">
        <p className="text-magenta-dark">{error}</p>
        <Link to="/" className="text-magenta text-sm">
          ← Back to the front page
        </Link>
      </div>
    );
  }
  if (!story) {
    return <div className="max-w-3xl mx-auto px-5 py-16 text-newsgrey">Loading…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <Link to="/" className="text-sm text-magenta font-semibold">
        ← Back to the front page
      </Link>

      <div className="mt-4 mb-2">
        <CategoryTag category={story.category} />
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
        {story.title}
      </h1>
      <p className="text-sm text-newsgrey mt-2">
        {formatDate(story.created_at)}
        {story.author && <> · by {story.author.username}</>}
      </p>

      {story.image_url && (
        <img
          src={story.image_url}
          alt={story.title}
          className="w-full rounded-md my-6 object-cover max-h-96"
        />
      )}

      <div className="prose prose-ink mt-6 whitespace-pre-wrap leading-relaxed text-ink/90">
        {story.body}
      </div>
      
      <ReactionBar targetType="story" targetId={story.id} />

      <CommentList storyId={story.id} comments={comments} setComments={setComments} />
    </div>
  );
}