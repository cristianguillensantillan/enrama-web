import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useData } from "../context/DataContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { homepage, API } = useData();
  const location = useLocation();
  const close = () => setIsOpen(false);

  const resolveImg = (src) => {
    if (!src) return null;
    if (src.startsWith("http")) return src;
    return `${API}${src}`;
  };

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/tienda", label: "Tienda" },
    { to: "/journal", label: "Journal" },
    { to: "/descargables", label: "Descargables" },
  ];

  return (
    <header className="header">
      <Link to="/" className="logo" onClick={close}>
        {homepage?.logo && (
          <img src={resolveImg(homepage.logo)} alt="Logo" />
        )}
        <span>enramá</span>
      </Link>

      <nav className={`menu ${isOpen ? "open" : ""}`}>
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            onClick={close}
            style={{
              color: location.pathname === to ? "var(--clr-accent)" : undefined,
            }}
          >
            {label}
          </Link>
        ))}
      </nav>

      <button
        className="hamburger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        style={{ background: "none", border: "none" }}
      >
        <div className={`bar ${isOpen ? "change" : ""}`} />
        <div className={`bar ${isOpen ? "change" : ""}`} />
        <div className={`bar ${isOpen ? "change" : ""}`} />
      </button>
    </header>
  );
}
