import React, { useEffect } from "react";
import { useData } from "../context/DataContext";

export default function Descargables() {
  const { downloadables, loading, API } = useData();

  useEffect(() => {
    document.title = "Descargables | enramá — Modelos 3D y Catálogos";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Descarga nuestros recursos gratuitos, incluyendo modelos 3D detallados de nuestros muebles y catálogos en PDF."
      );
    }
  }, []);

  const resolveImg = (src) => {
    if (!src) return null;
    if (src.startsWith("http")) return src;
    return `${API}${src}`;
  };

  const handleDownloadClick = async (e, item) => {
    const fileUrl = resolveImg(item.file);
    
    if (item.file.startsWith("http") && !item.file.startsWith(API)) {
      window.open(fileUrl, "_blank");
      return;
    }

    e.preventDefault();
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Error fetching file");
      const blob = await response.blob();
      
      const cleanUrl = fileUrl.split("?")[0].split("#")[0];
      const parts = cleanUrl.split(".");
      const ext = parts.length > 1 ? `.${parts.pop()}` : "";
      
      const filename = `${item.title}${ext}`;
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <div className="store-page">
      <div className="page-header">
        <span className="section-tag">Recursos y Contenido</span>
        <h1 className="section-title">Descargables</h1>
        <p className="section-body" style={{ margin: "0 auto 24px" }}>
          Ponemos a tu disposición catálogos informativos y modelos en tres dimensiones 
          de nuestras piezas para tus proyectos de diseño e interiorismo.
        </p>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
          <span>Cargando recursos…</span>
        </div>
      ) : downloadables.length === 0 ? (
        <div className="empty-state">
          <h3>No se encontraron descargables</h3>
          <p>Próximamente agregaremos nuevos recursos.</p>
        </div>
      ) : (
        <div className="downloads-grid">
          {downloadables.map((item) => (
            <div key={item.id} className="downloadable-card">
              <div className="downloadable-preview">
                <img 
                  src={resolveImg(item.previewImage)} 
                  alt={item.title} 
                  onError={(e) => {
                    e.target.style.background = "var(--clr-sand)";
                    e.target.src = "";
                  }}
                />
              </div>
              <div className="downloadable-info">
                <h3>{item.title}</h3>
                <p>{item.description || "Sin descripción disponible."}</p>
                <button 
                  onClick={(e) => handleDownloadClick(e, item)}
                  className="download-btn"
                  style={{ border: "none", cursor: "pointer", width: "100%" }}
                >
                  Descargar {item.fileType === "Catálogo PDF" ? "PDF" : "Archivo"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
