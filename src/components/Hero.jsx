import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";

export default function Hero() {
  const { homepage, API } = useData();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const hero = homepage?.hero || {
    title: "enramá",
    subtitle: "Artesanía tradicional del Cibao.",
    ctaText: "Comprar Ahora",
    images: [],
  };

  const images = hero.images || [];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const resolveImg = (src) => {
    if (!src) return null;
    if (src.startsWith("http") || src.startsWith("/uploads")) return `${API}${src.startsWith("/") ? "" : "/"}${src.replace(API, "")}`;
    return src;
  };

  return (
    <section className="hero">
      {/* Background slides */}
      {images.length > 0 ? (
        images.map((img, i) => {
          const imgUrl = typeof img === "object" ? img?.url : img;
          const imgPos = typeof img === "object" ? (img?.position || "center") : "center";
          return (
            <div
              key={i}
              className={`hero-slide ${i === current ? "active" : ""}`}
              style={{ 
                backgroundImage: `url(${resolveImg(imgUrl)})`,
                backgroundPosition: imgPos
              }}
            />
          );
        })
      ) : (
        <div
          className="hero-slide active"
          style={{ background: "linear-gradient(135deg, #5c4033 0%, #8b6f5e 100%)" }}
        />
      )}

      <div className="hero-overlay" />

      <div className="hero-content">
        <h1>{hero.title}</h1>
        <p>{hero.subtitle}</p>
        <button className="hero-cta" onClick={() => navigate("/tienda")}>
          {hero.ctaText}
        </button>
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="hero-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === current ? "active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
