import React, { useEffect } from "react";
import Hero from "../components/Hero";
import About from "../components/About";
import Newsletter from "../components/Newsletter";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { products, posts, loading, API } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "enramá — Mobiliario y Objetos Contemporáneos";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "enramá rescata técnicas vernáculas del Cibao utilizándolas en mobiliario contemporáneo de diseño único. Hecho en República Dominicana."
      );
    }
  }, []);

  const featured = products.filter((p) => p.featured).slice(0, 3);
  const recentPosts = posts.slice(0, 2);

  const resolveImg = (src) => {
    if (!src) return null;
    if (src.startsWith("http")) return src;
    return `${API}${src}`;
  };

  return (
    <>
      <Hero />
      <About />

      {/* Featured products strip */}
      {!loading && featured.length > 0 && (
        <section style={{ padding: "80px 40px", background: "var(--clr-cream)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span className="section-tag">Destacados</span>
              <h2 className="section-title">Nueva Colección Yarey</h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 2,
              }}
            >
              {featured.map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => navigate("/tienda")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="product-card-img">
                    <img
                      src={resolveImg(product.image)}
                      alt={product.name}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                  <div className="product-card-body">
                    <h3>{product.name}</h3>
                    <p className="product-price">Desde {product.price}</p>
                    <button
                      className="btn-order"
                      style={{ width: "100%" }}
                      onClick={(e) => { e.stopPropagation(); navigate("/tienda"); }}
                    >
                      Ver en tienda →
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button className="about-btn" onClick={() => navigate("/tienda")}>
                Ver todos los productos →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Journal preview strip */}
      {!loading && recentPosts.length > 0 && (
        <section style={{ padding: "80px 40px", background: "var(--clr-sand)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span className="section-tag">Journal</span>
              <h2 className="section-title">Últimas publicaciones</h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 32,
              }}
            >
              {recentPosts.map((post) => (
                <article
                  key={post.id}
                  className="blog-card"
                  onClick={() => navigate(`/journal/${post.id}`)}
                >
                  <div className="blog-card-img">
                    <img
                      src={resolveImg(post.coverImage)}
                      alt={post.title}
                      onError={(e) => {
                        e.target.parentElement.style.background =
                          "linear-gradient(135deg, #c9b9a7 0%, #8b6f5e 100%)";
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="blog-card-body">
                    <h3>{post.title}</h3>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    <button className="blog-read-more">Leer más →</button>
                  </div>
                </article>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button className="about-btn" onClick={() => navigate("/journal")}>
                Ver todos los posts →
              </button>
            </div>
          </div>
        </section>
      )}

      <Newsletter />
    </>
  );
}
