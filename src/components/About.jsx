import React, { useState } from "react";
import { useData } from "../context/DataContext";

export default function About() {
  const { homepage, API } = useData();
  const [expanded, setExpanded] = useState(false);

  const about = homepage?.about || {
    title: "Sobre enramá",
    headline: "MOBILIARIO Y OBJETOS CONTEMPORÁNEOS UTILIZANDO TÉCNICAS ARTESANALES VERNÁCULAS",
    body: "enramá rescata técnicas vernáculas utilizándolas en mobiliario contemporáneo que promociona y redimensiona esta artesanía tradicional del Cibao que se encuentran en grave peligro de desaparición.",
    readMoreText: "Leer más",
    readMoreContent: "",
  };

  const resolveImg = (src) => {
    if (!src) return null;
    if (src.startsWith("http")) return src;
    return `${API}${src}`;
  };

  return (
    <section className="about-section">
      <div className="about-inner">
        {/* Visual side */}
        <div className="about-visual">
          <div className="about-img-frame">
            {about.image ? (
              <img
                src={resolveImg(about.image)}
                alt={about.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
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
