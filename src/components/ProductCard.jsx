import React from "react";
import { useData } from "../context/DataContext";

export default function ProductCard({ product, onDetails, onOrder }) {
  const { API } = useData();

  const resolveImg = (src) => {
    if (!src) return null;
    if (src.startsWith("http")) return src;
    return `${API}${src}`;
  };

  return (
    <div className="product-card">
      <div className="product-card-img" onClick={() => onDetails(product)}>
        {product.featured && (
          <span className="product-badge">Destacado</span>
        )}
        <img
          src={resolveImg(product.image)}
          alt={product.name}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>

      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p className="product-price">
          {product.useLaunchPrice && product.launchPrice ? (
            <>
              <span className="product-price-launch">Desde {product.launchPrice}</span>
              <span className="product-price-original strikethrough">{product.price}</span>
            </>
          ) : (
            `Desde ${product.price}`
          )}
        </p>
        <div className="product-card-actions">
          <button
            className="btn-details"
            onClick={() => onDetails(product)}
          >
            Detalles
          </button>
          <button
            className="btn-order"
            onClick={() => onOrder(product)}
          >
            Ordenar
          </button>
        </div>
      </div>
    </div>
  );
}
