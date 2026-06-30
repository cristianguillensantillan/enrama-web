import React, { useState } from "react";
import { useData } from "../context/DataContext";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import OrderModal from "../components/OrderModal";

export default function Store() {
  const { products, loading } = useData();
  const [detailProduct, setDetailProduct] = useState(null);
  const [orderProduct, setOrderProduct] = useState(null);

  return (
    <>
      <title>Tienda — enramá</title>

      <div className="store-page">
        <div className="page-header">
          <span className="section-tag">Nuestra colección</span>
          <h1 className="section-title">Tienda</h1>
          <p className="section-body" style={{ margin: "0 auto" }}>
            Cada pieza es creada a mano por maestros artesanos del Cibao, usando
            técnicas que han pasado de generación en generación.
          </p>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
            <span>Cargando productos…</span>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>Próximamente</h3>
            <p>Estamos preparando nuevos productos para ti.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDetails={setDetailProduct}
                onOrder={setOrderProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details modal */}
      {detailProduct && (
        <ProductModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onOrder={(p) => {
            setDetailProduct(null);
            setOrderProduct(p);
          }}
        />
      )}

      {/* Order popup */}
      {orderProduct && (
        <OrderModal
          product={orderProduct}
          onClose={() => setOrderProduct(null)}
        />
      )}
    </>
  );
}
