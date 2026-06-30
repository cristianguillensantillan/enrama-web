import React, { useState, useEffect, useCallback } from "react";
import { useData } from "../context/DataContext";

export default function ProductModal({ product, onClose, onOrder }) {
  const { API } = useData();
  const [imgIdx, setImgIdx] = useState(0);
  const [activeImgSrc, setActiveImgSrc] = useState(null);

  const images = product?.images?.length ? product.images : [product?.image];

  useEffect(() => {
    if (product) {
      setActiveImgSrc(product.image || (product.images?.length ? product.images[0] : null));
      setImgIdx(0);
    }
  }, [product]);

  // Keyboard navigation
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setImgIdx((p) => {
          const next = (p + 1) % images.length;
          setActiveImgSrc(images[next]);
          return next;
        });
      }
      if (e.key === "ArrowLeft") {
        setImgIdx((p) => {
          const prev = p === 0 ? images.length - 1 : p - 1;
          setActiveImgSrc(images[prev]);
          return prev;
        });
      }
    },
    [onClose, images]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  if (!product) return null;

  const resolveImg = (src) => {
    if (!src) return null;
    if (src.startsWith("http")) return src;
    return `${API}${src}`;
  };

  const handleColorSelect = (colorImg) => {
    if (!colorImg) return;
    setActiveImgSrc(colorImg);
    const idx = images.indexOf(colorImg);
    if (idx !== -1) {
      setImgIdx(idx);
    } else {
      setImgIdx(-1);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Left: Image carousel */}
        <div className="modal-carousel">
          <img
            src={resolveImg(activeImgSrc || images[imgIdx])}
            alt={product.name}
            className="modal-carousel-img"
            onError={(e) => { e.target.src = ""; e.target.style.background = "var(--clr-sand)"; }}
          />

          {images.length > 1 && (
            <>
              <div className="carousel-nav">
                <button
                  className="carousel-btn"
                  onClick={() => {
                    setImgIdx((p) => {
                      const prev = p === 0 ? images.length - 1 : p - 1;
                      setActiveImgSrc(images[prev]);
                      return prev;
                    });
                  }}
                  aria-label="Imagen anterior"
                >
                  ‹
                </button>
                <button
                  className="carousel-btn"
                  onClick={() => {
                    setImgIdx((p) => {
                      const next = (p + 1) % images.length;
                      setActiveImgSrc(images[next]);
                      return next;
                    });
                  }}
                  aria-label="Siguiente imagen"
                >
                  ›
                </button>
              </div>
              <div className="carousel-dots">
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={`carousel-dot ${i === imgIdx ? "active" : ""}`}
                    onClick={() => {
                      setImgIdx(i);
                      setActiveImgSrc(images[i]);
                    }}
                    aria-label={`Imagen ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Product info */}
        <div className="modal-info">
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>

          <h2>{product.name}</h2>
          <p className="modal-price">{product.price}</p>

          {/* Color variant selectors */}
          {product.colors && product.colors.length > 0 && (
            <div className="modal-colors-section">
              <span className="modal-colors-label">Colores disponibles:</span>
              <div className="modal-colors-list">
                {product.colors.map((color, i) => (
                  <button
                    key={i}
                    className={`modal-color-btn ${activeImgSrc === color.image ? "active" : ""}`}
                    onClick={() => handleColorSelect(color.image)}
                    title={`Color ${i + 1}`}
                  >
                    {color.icon ? (
                      <img src={resolveImg(color.icon)} alt={`Color ${i + 1}`} />
                    ) : (
                      <span className="color-placeholder" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="modal-specs">
            {product.material && (
              <div className="modal-spec">
                <span>Material</span>
                <span>{product.material}</span>
              </div>
            )}
            {product.dimensiones && (
              <div className="modal-spec">
                <span>Dimensiones</span>
                <span>{product.dimensiones}</span>
              </div>
            )}
          </div>

          {product.info && (
            <p className="modal-desc">{product.info}</p>
          )}

          <button
            className="modal-order-btn"
            onClick={() => {
              onClose();
              onOrder(product);
            }}
          >
            Ordenar este producto →
          </button>
        </div>
      </div>
    </div>
  );
}
