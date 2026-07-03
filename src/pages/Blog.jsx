import React, { useEffect } from "react";
import { useData } from "../context/DataContext";
import BlogCard from "../components/BlogCard";

export default function Blog() {
  const { posts, loading } = useData();

  useEffect(() => {
    document.title = "Journal | enramá — Historias de la Artesanía Dominicana";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Conoce las historias de nuestros maestros artesanos, el rescate de las técnicas del Cibao y el proceso de creación detrás de cada mueble enramá."
      );
    }
  }, []);

  return (
    <div className="blog-page">
      <div className="page-header" style={{ textAlign: "center", marginBottom: 56 }}>
        <span className="section-tag">Historias y artesanía</span>
        <h1 className="section-title">Journal</h1>
        <p className="section-body" style={{ margin: "0 auto" }}>
          Descubre el proceso detrás de cada pieza, las técnicas ancestrales del
          Cibao y las historias de nuestros maestros artesanos.
        </p>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
          <span>Cargando publicaciones…</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <h3>Próximamente</h3>
          <p>Estamos preparando publicaciones para ti.</p>
        </div>
      ) : (
        <div className="blog-grid">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
