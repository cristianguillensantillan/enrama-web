import React, { useState } from "react";
import { useData } from "../context/DataContext";

export default function Newsletter() {
  const { homepage, sendNewsletter } = useData();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const nl = homepage?.newsletter || {
    title: "Suscríbete a nuestro Newsletter",
    subtitle: "Recibe descuentos y ofertas especiales",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    const result = await sendNewsletter(email);
    if (result.ok) {
      setStatus("success");
      setEmail("");
    } else {
      setStatus("error");
    }
  };

  return (
    <section className="newsletter-section">
      <span className="section-tag" style={{ color: "var(--clr-accent-light)" }}>
        Mantente al día
      </span>
      <h2 className="section-title">{nl.title}</h2>
      <p className="section-body">{nl.subtitle}</p>

      {status === "success" ? (
        <p className="newsletter-msg" style={{ color: "var(--clr-accent-light)" }}>
          ✓ ¡Gracias por suscribirte! Pronto recibirás nuestras novedades.
        </p>
      ) : (
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Enviando…" : "Suscribirse"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="newsletter-msg" style={{ color: "var(--clr-error)" }}>
          Hubo un error. Por favor intenta de nuevo.
        </p>
      )}
    </section>
  );
}
