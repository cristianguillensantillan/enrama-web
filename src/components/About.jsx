import React, { useState, useEffect } from "react";
import { useData } from "../context/DataContext";

export default function About() {
  const { homepage, API } = useData();
  const [expanded, setExpanded] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const about = homepage?.about || {
    title: "Sobre enramá",
    headline: "MOBILIARIO Y OBJETOS CONTEMPORÁNEOS UTILIZANDO TÉCNICAS ARTESANALES VERNÁCULAS",
    body: "enramá rescata técnicas vernáculas utilizándolas en mobiliario contemporáneo que promociona y redimensiona esta artesanía tradicional del Cibao que se encuentran en grave peligro de desaparición.",
    readMoreText: "Leer más",
    readMoreContent: "",
  };

  const images = about.images || (about.image ? [about.image] : []);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIdx((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const resolveImg = (src) => {
    if (!src) return null;
    if (src.startsWith("http")) return src;
    return `${API}${src}`;
  };

  const handleNext = () => {
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="about-section">
      <div className="about-inner">
        {/* Visual side */}
        <div className="about-visual">
          <div className="about-img-frame" style={{ position: "relative", overflow: "hidden" }}>
            {images.length > 0 ? (
              <div className="about-carousel" style={{ position: "relative", width: "100%", height: "100%" }}>
                {images.map((imgSrc, idx) => (
                  <img
                    key={idx}
                    src={resolveImg(imgSrc)}
                    alt={`${about.title} ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      opacity: idx === activeImageIdx ? 1 : 0,
                      transition: "opacity 0.6s ease-in-out",
                      zIndex: idx === activeImageIdx ? 1 : 0,
                    }}
                  />
                ))}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="about-carousel-arrow arrow-prev"
                      aria-label="Anterior"
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "16px",
                        transform: "translateY(-50%)",
                        zIndex: 10,
                        background: "rgba(255, 255, 255, 0.8)",
                        border: "none",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-sm)",
                        transition: "all var(--transition)",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--clr-dark)" strokeWidth="2.5">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="about-carousel-arrow arrow-next"
                      aria-label="Siguiente"
                      style={{
                        position: "absolute",
                        top: "50%",
                        right: "16px",
                        transform: "translateY(-50%)",
                        zIndex: 10,
                        background: "rgba(255, 255, 255, 0.8)",
                        border: "none",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "var(--shadow-sm)",
                        transition: "all var(--transition)",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--clr-dark)" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>

                    {/* Dots indicator */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "16px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 10,
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIdx(idx)}
                          aria-label={`Ir a imagen ${idx + 1}`}
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            background: idx === activeImageIdx ? "var(--clr-accent)" : "rgba(255, 255, 255, 0.5)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            transition: "all var(--transition)",
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(160deg, #c9b9a7 0%, #8b6f5e 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "5rem",
                    color: "rgba(255,255,255,0.25)",
                    letterSpacing: "4px",
                    fontStyle: "italic",
                  }}
                >
                  e
                </span>
              </div>
            )}
          </div>
          <div className="about-badge">hecho<br />a mano</div>
        </div>

        {/* Text side */}
        <div className="about-text">
          <span className="section-tag">Nuestra historia</span>
          <h2 className="section-title">{about.title}</h2>
          <p className="about-headline">{about.headline}</p>
          <p className="section-body">{about.body}</p>

          {about.readMoreContent && (
            <>
              {expanded && (
                <p className="about-expand">{about.readMoreContent}</p>
              )}
              <button className="about-btn" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Leer menos ↑" : `${about.readMoreText || "Leer más"} →`}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
