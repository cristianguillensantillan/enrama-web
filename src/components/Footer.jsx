import React from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";

export default function Footer() {
  const { homepage } = useData();
  const contact = homepage?.contact || {};

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <h3>enramá</h3>
          <p>
            Mobiliario y objetos contemporáneos utilizando técnicas artesanales
            vernáculas del Cibao dominicano.
          </p>
        </div>

        <div className="footer-col">
          <h4>Navegación</h4>
          <Link to="/">Inicio</Link>
          <Link to="/tienda">Tienda</Link>
          <Link to="/journal">Journal</Link>
        </div>

        <div className="footer-col">
          <h4>Contacto</h4>
          {contact.email && (
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          )}
          {contact.phone && <p>{contact.phone}</p>}
          {contact.instagram && (
            <a
              href={contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-link"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                alt="Instagram"
                className="instagram-icon"
              />
              @enrama.do
            </a>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} enramá. Artesanía tradicional del Cibao.
        </p>
      </div>
    </footer>
  );
}
