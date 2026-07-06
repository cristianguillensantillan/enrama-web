import React, { useState, useEffect, useCallback } from "react";
import { useData } from "../context/DataContext";

export default function OrderModal({ product, onClose }) {
  const { sendOrder } = useData();
  const [status, setStatus] = useState("form"); // form | loading | success | error
  const [error, setError] = useState("");

  const getWoodInfo = (val) => {
    if (!val) return null;
    if (typeof val === 'string') return null;
    if (val.name) return { icon: val.icon || null, name: val.name, price: val.price || product?.price };
    return null;
  };

  const availableWoods = product?.colors?.map(getWoodInfo).filter(Boolean) || [];

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    cantidad: "1",
    notas: "",
    requiereTransporte: false,
    requiereFactura: false,
    madera: "",
  });

  useEffect(() => {
    if (product) {
      const defaultWood = product.colors?.map(val => {
        if (val && typeof val === 'object' && val.name) return val.name;
        return null;
      }).filter(Boolean)[0] || "";
      setForm(f => ({ ...f, madera: defaultWood }));
    }
  }, [product]);

  const handleKey = useCallback(
    (e) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
    };
  }, [handleKey]);

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const validate = () => {
    if (!form.nombre.trim()) return "El nombre es obligatorio.";
    if (!form.telefono.trim()) return "El teléfono es obligatorio.";
    if (!form.direccion.trim()) return "La dirección es obligatoria.";
    if (form.email.trim()) {
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(form.email)) return "Ingresa un correo válido.";
    }
    return null;
  };

  const selectedWoodObj = availableWoods.find(w => w.name === form.madera);
  const baseProductPrice = product?.useLaunchPrice && product?.launchPrice 
    ? product.launchPrice 
    : product?.price;
  const activePrice = selectedWoodObj?.price || baseProductPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setStatus("loading");

    const orderedProduct = {
      ...product,
      name: form.madera ? `${product.name} (Madera: ${form.madera})` : product.name,
      price: activePrice,
    };

    const result = await sendOrder(orderedProduct, form);
    if (result.ok) {
      setStatus("success");
    } else {
      setError(result.message || "Error al enviar la orden.");
      setStatus("form");
    }
  };

  if (!product) return null;

  return (
    <div className="order-overlay" onClick={onClose}>
      <div className="order-box" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          style={{ position: "absolute", top: 16, right: 16 }}
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>

        {status === "success" ? (
          <div className="order-success">
            <div className="success-icon">✓</div>
            <h3>¡Orden recibida!</h3>
            <p>
              Gracias, <strong>{form.nombre}</strong>. Hemos recibido tu orden
              de <strong>{product.name}</strong> y nos pondremos en contacto
              contigo pronto.
            </p>
            {form.email && (
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--clr-earth)", margin: 0 }}>
                  Se envió una confirmación a <strong>{form.email}</strong>.
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--clr-bark-light)", fontStyle: "italic", margin: 0, opacity: 0.9 }}>
                  (Si no lo recibes en tu bandeja de entrada, por favor revisa tu carpeta de <strong>correo no deseado o spam</strong>).
                </p>
              </div>
            )}
            <button className="order-success-btn" onClick={onClose}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <h2>Ordenar producto</h2>
            <p className="order-product-name">
              Estás ordenando: <strong>{product.name}</strong> —{" "}
              <strong style={{ color: "var(--clr-accent)" }}>
                Desde {activePrice}
                {product.useLaunchPrice && product.launchPrice && !selectedWoodObj?.price && (
                  <span className="order-price-original strikethrough" style={{ marginLeft: "8px", fontSize: "0.85em", color: "var(--clr-tan)", textDecoration: "line-through", fontWeight: "normal" }}>
                    {product.price}
                  </span>
                )}
              </strong>
            </p>
            {product.material && (
              <p className="order-product-material" style={{ fontSize: "0.85rem", color: "var(--clr-earth)", marginTop: "-12px", marginBottom: "16px" }}>
                Material base: <strong>{product.material}</strong>
              </p>
            )}

            <form className="order-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre completo *</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Para enviarte confirmación"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono *</label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  placeholder="Tu número de teléfono"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="direccion">Dirección de entrega *</label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  placeholder="Ciudad, calle, apartamento..."
                  value={form.direccion}
                  onChange={handleChange}
                />
              </div>

              {availableWoods.length > 0 && (
                <div className="form-group">
                  <label htmlFor="madera">Tipo de Madera *</label>
                  <select
                    id="madera"
                    name="madera"
                    value={form.madera}
                    onChange={handleChange}
                  >
                    {availableWoods.map((wood, idx) => (
                      <option key={idx} value={wood.name}>
                        {wood.name} (Desde {wood.price || product.price})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="cantidad">Cantidad</label>
                <select
                  id="cantidad"
                  name="cantidad"
                  value={form.cantidad}
                  onChange={handleChange}
                >
                  {[...Array(50)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "14px 0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "normal", fontSize: "0.9rem", cursor: "pointer", margin: 0, textTransform: "none", letterSpacing: "normal" }}>
                  <input
                    type="checkbox"
                    name="requiereTransporte"
                    checked={form.requiereTransporte}
                    onChange={handleChange}
                  />
                  ¿Requiere servicio de transporte?
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "normal", fontSize: "0.9rem", cursor: "pointer", margin: 0, textTransform: "none", letterSpacing: "normal" }}>
                  <input
                    type="checkbox"
                    name="requiereFactura"
                    checked={form.requiereFactura}
                    onChange={handleChange}
                  />
                  ¿Requiere factura con valor fiscal (crédito fiscal)?
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="notas">Notas adicionales</label>
                <textarea
                  id="notas"
                  name="notas"
                  placeholder="Escribe aquí alguna nota adicional."
                  value={form.notas}
                  onChange={handleChange}
                />
              </div>

              {error && <p className="order-error">⚠ {error}</p>}

              <button
                type="submit"
                className="order-submit-btn"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Enviando orden…" : "Confirmar orden →"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
