import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { posts, API } = useData();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = posts.find((p) => p.id === id);
    if (found) {
      setPost(found);
      setLoading(false);
    } else if (posts.length > 0) {
      // Post not found
      setLoading(false);
    }
  }, [id, posts]);

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

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: "60vh" }}>
        <div className="spinner" />
        <span>Cargando…</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="empty-state" style={{ minHeight: "60vh" }}>
        <h3>Publicación no encontrada</h3>
        <p>La publicación que buscas no existe o fue eliminada.</p>
        <button
          className="about-btn"
          style={{ marginTop: 20 }}
          onClick={() => navigate("/journal")}
        >
          ← Volver al Journal
        </button>
      </div>
    );
  }

  return (
    <article className="blog-post-page">
      <div className={`blog-post-header ${post.coverImage ? "has-cover" : ""}`}>
        {post.coverImage && (
          <>
            <img
              src={resolveImg(post.coverImage)}
              alt={post.title}
              className="blog-post-cover-bg"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.classList.remove('has-cover');
              }}
            />
            <div className="blog-post-header-overlay" />
          </>
        )}

        <div className="blog-post-header-content">
          <button className="back-btn" onClick={() => navigate("/journal")}>
            ← Volver al Journal
          </button>

          <div className="blog-post-header-text">
            {post.tags?.length > 0 && (
              <div className="blog-tags">
                {post.tags.map((t) => (
                  <span key={t} className="blog-tag">{t}</span>
                ))}
              </div>
            )}
            <h1>{post.title}</h1>
            <div className="blog-post-meta">
              <span>📅 {formatDate(post.date)}</span>
              {post.author && <span>✍ {post.author}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="blog-post-container">
        <div 
          className="blog-post-content" 
          dangerouslySetInnerHTML={{ 
            __html: post.content ? post.content.replaceAll('/uploads/', `${API}/uploads/`) : "" 
          }}
        />
      </div>
    </article>
  );
}
