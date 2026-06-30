import React from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

export default function BlogCard({ post }) {
  const navigate = useNavigate();
  const { API } = useData();

  const resolveImg = (src) => {
    if (!src) return null;
    if (src.startsWith("http")) return src;
    return `${API}${src}`;
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("es-DO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <article className="blog-card" onClick={() => navigate(`/journal/${post.id}`)}>
      <div className="blog-card-img">
        <img
          src={resolveImg(post.coverImage)}
          alt={post.title}
          onError={(e) => {
            e.target.parentElement.style.background = "linear-gradient(135deg, #c9b9a7 0%, #8b6f5e 100%)";
            e.target.style.display = "none";
          }}
        />
      </div>

      <div className="blog-card-body">
        <div className="blog-card-meta">
          <span>📅 {formatDate(post.date)}</span>
          {post.author && <span>✍ {post.author}</span>}
        </div>

        <h3>{post.title}</h3>

        {post.excerpt && <p>{post.excerpt}</p>}

        {post.tags?.length > 0 && (
          <div className="blog-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="blog-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <button className="blog-read-more">
          Leer más →
        </button>
      </div>
    </article>
  );
}
