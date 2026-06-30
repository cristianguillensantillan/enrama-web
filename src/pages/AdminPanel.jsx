import React, { useState, useEffect, useRef } from "react";
import { useData } from "../context/DataContext";

// ─── Admin Login Gate ─────────────────────────────────────
function AdminLogin({ onLogin }) {
  const { login } = useData();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(form.username, form.password);
    if (result.ok) {
      onLogin();
    } else {
      setError(result.message || "Credenciales incorrectas");
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <h1>enramá</h1>
        <p>Panel de administración</p>
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuario"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
          />
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Autenticando…" : "Entrar"}
          </button>
        </form>
        {error && <p className="admin-login-error">⚠ {error}</p>}
      </div>
    </div>
  );
}

// ─── Product Form Modal ───────────────────────────────────
function ProductForm({ product, onSave, onCancel }) {
  const { API } = useData();
  const [form, setForm] = useState({
    name: product?.name || "",
    price: product?.price || "",
    info: product?.info || "",
    material: product?.material || "",
    dimensiones: product?.dimensiones || "",
    featured: product?.featured ? "true" : "false",
  });
  const [mainImage, setMainImage] = useState(null);
  const [extraImages, setExtraImages] = useState([]);
  
  const [colorIcon1, setColorIcon1] = useState(null);
  const [colorIcon2, setColorIcon2] = useState(null);
  const [colorIcon3, setColorIcon3] = useState(null);

  const [colorImage1, setColorImage1] = useState(null);
  const [colorImage2, setColorImage2] = useState(null);
  const [colorImage3, setColorImage3] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim()) {
      setError("Nombre y precio son obligatorios.");
      return;
    }
    setSaving(true);
    setError("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (mainImage) fd.append("image", mainImage);
    extraImages.forEach((img) => fd.append("images", img));

    if (colorIcon1) fd.append("colorIcon1", colorIcon1);
    if (colorIcon2) fd.append("colorIcon2", colorIcon2);
    if (colorIcon3) fd.append("colorIcon3", colorIcon3);

    if (colorImage1) fd.append("colorImage1", colorImage1);
    if (colorImage2) fd.append("colorImage2", colorImage2);
    if (colorImage3) fd.append("colorImage3", colorImage3);

    const result = await onSave(fd);
    if (!result.ok) setError(result.message || "Error al guardar");
    setSaving(false);
  };

  return (
    <div className="admin-form-overlay" onClick={onCancel}>
      <div className="admin-form-box" onClick={(e) => e.stopPropagation()}>
        <h3>{product ? "Editar producto" : "Nuevo producto"}</h3>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div>
            <label>Nombre *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Ej: Mecedora" />
          </div>
          <div>
            <label>Precio *</label>
            <input name="price" value={form.price} onChange={handleChange} placeholder="Ej: $20,000" />
          </div>
          <div>
            <label>Material</label>
            <input name="material" value={form.material} onChange={handleChange} placeholder="Ej: Madera de roble" />
          </div>
          <div>
            <label>Dimensiones</label>
            <input name="dimensiones" value={form.dimensiones} onChange={handleChange} placeholder="Ej: 60cm x 80cm x 100cm" />
          </div>
          <div>
            <label>Descripción</label>
            <textarea name="info" value={form.info} onChange={handleChange} placeholder="Descripción del producto…" rows={3} />
          </div>
          <div>
            <label>Destacado</label>
            <select name="featured" value={form.featured} onChange={handleChange}>
              <option value="true">Sí — mostrar en página principal</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label>Imagen principal</label>
            <input type="file" accept="image/*" onChange={(e) => setMainImage(e.target.files[0])} />
          </div>
          <div>
            <label>Imágenes adicionales (carrusel)</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setExtraImages([...e.target.files])} />
          </div>

          <div className="admin-colors-section">
            <h4>Variantes de Color (Hasta 3)</h4>
            <div className="admin-colors-grid">
              {[0, 1, 2].map((idx) => {
                const color = product?.colors?.[idx];
                const setIcon = [setColorIcon1, setColorIcon2, setColorIcon3][idx];
                const setImage = [setColorImage1, setColorImage2, setColorImage3][idx];
                const iconVal = [colorIcon1, colorIcon2, colorIcon3][idx];
                const imageVal = [colorImage1, colorImage2, colorImage3][idx];
                return (
                  <div key={idx} className="admin-color-col">
                    <h5>Color {idx + 1}</h5>
                    
                    {color && (
                      <div className="admin-existing-color-previews">
                        {color.icon && (
                          <div className="admin-existing-color-preview-item">
                            <span>Icono:</span>
                            <img src={`${API}${color.icon}`} alt={`Icono ${idx+1}`} />
                          </div>
                        )}
                        {color.image && (
                          <div className="admin-existing-color-preview-item">
                            <span>Imagen:</span>
                            <img src={`${API}${color.image}`} alt={`Producto ${idx+1}`} />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="admin-file-input-group">
                      <label>Icono de color</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setIcon(e.target.files[0])} 
                      />
                      {iconVal && <span className="file-selected">✓ {iconVal.name}</span>}
                    </div>

                    <div className="admin-file-input-group">
                      <label>Imagen del producto</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setImage(e.target.files[0])} 
                      />
                      {imageVal && <span className="file-selected">✓ {imageVal.name}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && <p style={{ color: "var(--clr-error)", fontSize: "0.85rem" }}>⚠ {error}</p>}

          <div className="admin-form-actions">
            <button type="button" className="admin-cancel-btn" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="admin-save-btn" disabled={saving}>
              {saving ? "Guardando…" : "Guardar producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PostForm({ post, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: post?.title || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    author: post?.author || "Enramá",
    tags: post?.tags?.join(", ") || "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const textareaRef = useRef(null);
  const { API, adminToken } = useData();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imgMeta, setImgMeta] = useState({
    title: "",
    author: "",
    details: "",
    file: null,
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleInsertImageClick = () => {
    setImgMeta({
      title: "",
      author: "",
      details: "",
      file: null,
    });
    setShowImageModal(true);
  };

  const handleImageUploadWithMeta = async () => {
    if (!imgMeta.file) return;
    setUploadingImage(true);
    setError("");

    const fd = new FormData();
    fd.append("file", imgMeta.file);

    try {
      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;

          let captionText = "";
          if (imgMeta.title.trim()) {
            captionText += `<strong>${imgMeta.title.trim()}</strong>`;
          }
          if (imgMeta.author.trim()) {
            captionText += captionText ? ` — Foto por ${imgMeta.author.trim()}` : `Foto por ${imgMeta.author.trim()}`;
          }
          if (imgMeta.details.trim()) {
            captionText += captionText 
              ? `. <span style="font-size: 0.8rem; display: block; opacity: 0.8; margin-top: 2px;">${imgMeta.details.trim()}</span>`
              : `<span style="font-size: 0.8rem; display: block; opacity: 0.8; margin-top: 2px;">${imgMeta.details.trim()}</span>`;
          }

          const figcaptionHtml = captionText 
            ? `\n  <figcaption style="font-size: 0.85rem; color: var(--clr-bark-light); line-height: 1.4; font-style: italic; max-width: 600px; margin: 0.5rem auto 0; text-align: center;">${captionText}</figcaption>`
            : "";

          const imgTag = `\n<figure style="margin: 2rem auto; max-width: 100%; display: block; text-align: center;">\n  <img src="${data.url}" style="display:block; max-width:100%; height:auto; margin:0 auto; border-radius:8px;" alt="${imgMeta.title.trim() || "imagen"}" />${figcaptionHtml}\n</figure>\n`;

          const newContent = text.substring(0, start) + imgTag + text.substring(end);
          setForm((prev) => ({ ...prev, content: newContent }));

          setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + imgTag.length;
          }, 50);
        }
        setShowImageModal(false);
      } else {
        setError("Error al subir la imagen.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de red al subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Título y contenido son obligatorios.");
      return;
    }
    setSaving(true);
    setError("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (coverImage) fd.append("coverImage", coverImage);

    const result = await onSave(fd);
    if (!result.ok) setError(result.message || "Error al guardar");
    setSaving(false);
  };

  return (
    <div className="admin-form-overlay" onClick={onCancel}>
      <div className="admin-form-box" onClick={(e) => e.stopPropagation()}>
        <h3>{post ? "Editar publicación" : "Nueva publicación"}</h3>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div>
            <label>Título *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Título del post" />
          </div>
          <div>
            <label>Extracto (resumen)</label>
            <textarea name="excerpt" value={form.excerpt} onChange={handleChange} placeholder="Breve descripción…" rows={2} />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ marginBottom: 0 }}>Contenido *</label>
              <button
                type="button"
                className="admin-add-btn"
                onClick={handleInsertImageClick}
                style={{
                  fontSize: "0.8rem",
                  padding: "4px 10px",
                  margin: 0,
                  height: "auto",
                  lineHeight: 1.2
                }}
              >
                🖼 Insertar imagen en texto
              </button>
            </div>
            <textarea
              ref={textareaRef}
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Escribe el contenido completo…"
              rows={12}
            />
          </div>
          <div>
            <label>Autor</label>
            <input name="author" value={form.author} onChange={handleChange} />
          </div>
          <div>
            <label>Etiquetas (separadas por coma)</label>
            <input name="tags" value={form.tags} onChange={handleChange} placeholder="artesanía, tradición, diseño" />
          </div>
          <div>
            <label>Imagen de portada</label>
            <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} />
          </div>

          {error && <p style={{ color: "var(--clr-error)", fontSize: "0.85rem" }}>⚠ {error}</p>}

          <div className="admin-form-actions">
            <button type="button" className="admin-cancel-btn" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="admin-save-btn" disabled={saving}>
              {saving ? "Guardando…" : "Guardar publicación"}
            </button>
          </div>
        </form>
      </div>

      {/* Sub-modal for adding image with metadata */}
      {showImageModal && (
        <div className="admin-form-overlay" style={{ zIndex: 1010 }} onClick={() => setShowImageModal(false)}>
          <div className="admin-form-box" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h4 style={{ marginBottom: 16, fontFamily: "var(--font-heading)" }}>Insertar Imagen con Detalles</h4>
            
            <div className="admin-form">
              <div>
                <label style={{ fontSize: "0.8rem" }}>Título de la fotografía</label>
                <input 
                  type="text" 
                  value={imgMeta.title} 
                  onChange={(e) => setImgMeta({ ...imgMeta, title: e.target.value })} 
                  placeholder="Ej. Silla tejida de perfil" 
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem" }}>Autor de la foto</label>
                <input 
                  type="text" 
                  value={imgMeta.author} 
                  onChange={(e) => setImgMeta({ ...imgMeta, author: e.target.value })} 
                  placeholder="Ej. Juan Pérez" 
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem" }}>Detalles adicionales</label>
                <input 
                  type="text" 
                  value={imgMeta.details} 
                  onChange={(e) => setImgMeta({ ...imgMeta, details: e.target.value })} 
                  placeholder="Ej. Junio 2026, Santo Domingo" 
                />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem" }}>Seleccionar archivo *</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImgMeta({ ...imgMeta, file: e.target.files[0] })} 
                />
              </div>
              
              <div className="admin-form-actions" style={{ marginTop: 24 }}>
                <button 
                  type="button" 
                  className="admin-cancel-btn" 
                  onClick={() => setShowImageModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="admin-save-btn" 
                  onClick={handleImageUploadWithMeta}
                  disabled={uploadingImage || !imgMeta.file}
                >
                  {uploadingImage ? "Subiendo..." : "Insertar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────
function ProductsTab() {
  const { products, createProduct, updateProduct, deleteProduct, API } = useData();
  const [form, setForm] = useState(null); // null | 'new' | product object

  const resolveImg = (src) => {
    if (!src) return null;
    if (src.startsWith("http")) return src;
    return `${API}${src}`;
  };

  const handleSave = async (fd) => {
    if (form === "new") {
      const r = await createProduct(fd);
      if (r.ok) setForm(null);
      return r;
    } else {
      const r = await updateProduct(form.id, fd);
      if (r.ok) setForm(null);
      return r;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este producto?")) await deleteProduct(id);
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2>Productos</h2>
        <button className="admin-add-btn" onClick={() => setForm("new")}>
          + Nuevo producto
        </button>
      </div>

      <div className="admin-list">
        {products.length === 0 && (
          <div className="empty-state">
            <h3>Sin productos</h3>
            <p>Agrega tu primer producto.</p>
          </div>
        )}
        {products.map((p) => (
          <div key={p.id} className="admin-item">
            <img src={resolveImg(p.image)} alt={p.name} className="admin-item-img"
              onError={(e) => { e.target.style.background = "var(--clr-sand)"; e.target.src = ""; }} />
            <div className="admin-item-info">
              <h4>{p.name}</h4>
              <p>{p.price} {p.featured ? "· ⭐ Destacado" : ""}</p>
            </div>
            <div className="admin-item-actions">
              <button className="admin-edit-btn" onClick={() => setForm(p)}>Editar</button>
              <button className="admin-delete-btn" onClick={() => handleDelete(p.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {form !== null && (
        <ProductForm
          product={form === "new" ? null : form}
          onSave={handleSave}
          onCancel={() => setForm(null)}
        />
      )}
    </div>
  );
}

// ─── Blog Tab ─────────────────────────────────────────────
function BlogTab() {
  const { posts, createPost, updatePost, deletePost, API } = useData();
  const [form, setForm] = useState(null);

  const resolveImg = (src) => {
    if (!src) return null;
    if (src.startsWith("http")) return src;
    return `${API}${src}`;
  };

  const handleSave = async (fd) => {
    if (form === "new") {
      const r = await createPost(fd);
      if (r.ok) setForm(null);
      return r;
    } else {
      const r = await updatePost(form.id, fd);
      if (r.ok) setForm(null);
      return r;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar esta publicación?")) await deletePost(id);
  };

  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString("es-DO", { year: "numeric", month: "short", day: "numeric" }); }
    catch { return d; }
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2>Journal</h2>
        <button className="admin-add-btn" onClick={() => setForm("new")}>
          + Nueva publicación
        </button>
      </div>

      <div className="admin-list">
        {posts.length === 0 && (
          <div className="empty-state">
            <h3>Sin publicaciones</h3>
            <p>Agrega tu primera publicación.</p>
          </div>
        )}
        {posts.map((p) => (
          <div key={p.id} className="admin-item">
            <img src={resolveImg(p.coverImage)} alt={p.title} className="admin-item-img"
              onError={(e) => { e.target.style.background = "var(--clr-sand)"; e.target.src = ""; }} />
            <div className="admin-item-info">
              <h4>{p.title}</h4>
              <p>{formatDate(p.date)} · {p.author}</p>
            </div>
            <div className="admin-item-actions">
              <button className="admin-edit-btn" onClick={() => setForm(p)}>Editar</button>
              <button className="admin-delete-btn" onClick={() => handleDelete(p.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {form !== null && (
        <PostForm
          post={form === "new" ? null : form}
          onSave={handleSave}
          onCancel={() => setForm(null)}
        />
      )}
    </div>
  );
}

function HomepageTab() {
  const { homepage, updateHomepage, API } = useData();
  const [form, setForm] = useState(null);
  const [heroImages, setHeroImages] = useState([]);
  const [aboutImage, setAboutImage] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (homepage && !form) {
      setForm({
        heroTitle: homepage.hero?.title || "",
        heroSubtitle: homepage.hero?.subtitle || "",
        heroCtaText: homepage.hero?.ctaText || "",
        aboutTitle: homepage.about?.title || "",
        aboutHeadline: homepage.about?.headline || "",
        aboutBody: homepage.about?.body || "",
        aboutReadMoreText: homepage.about?.readMoreText || "",
        aboutReadMoreContent: homepage.about?.readMoreContent || "",
        newsletterTitle: homepage.newsletter?.title || "",
        newsletterSubtitle: homepage.newsletter?.subtitle || "",
        contactEmail: homepage.contact?.email || "",
        contactPhone: homepage.contact?.phone || "",
        contactInstagram: homepage.contact?.instagram || "",
      });
    }
  }, [homepage]);

  if (!form) return <div className="loading-spinner"><div className="spinner" /></div>;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    heroImages.forEach((img) => fd.append("heroImages", img));
    if (aboutImage) fd.append("aboutImage", aboutImage);
    if (logoFile) fd.append("logo", logoFile);
    const r = await updateHomepage(fd);
    setSaving(false);
    if (r.ok) setSaved(true);
  };

  const Field = ({ label, name, type = "text", rows }) => (
    <div>
      <label>{label}</label>
      {rows ? (
        <textarea name={name} value={form[name]} onChange={handleChange} rows={rows} />
      ) : (
        <input type={type} name={name} value={form[name]} onChange={handleChange} />
      )}
    </div>
  );

  return (
    <div>
      <div className="admin-section-header">
        <h2>Página principal</h2>
      </div>

      {saved && (
        <div className="save-success-banner" style={{ marginBottom: 24 }}>
          ✓ Cambios guardados exitosamente
        </div>
      )}

      <form className="homepage-admin-form" onSubmit={handleSave}>
        {/* General Settings (Logo) */}
        <div className="admin-form-section">
          <h3>⚙️ Configuración General</h3>
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--clr-bark)", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Logo de la página (Header)
            </label>
            {homepage?.logo && (
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: "0.85rem", color: "var(--clr-bark-light)" }}>Logo actual: </span>
                <a 
                  href={`${API}${homepage.logo}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ fontSize: "0.85rem", color: "var(--clr-earth)", textDecoration: "underline" }}
                >
                  Ver logo
                </a>
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
          </div>
        </div>

        {/* Hero */}
        <div className="admin-form-section">
          <h3>🖼 Hero (portada)</h3>
          <div className="admin-form admin-form-row">
            <Field label="Título" name="heroTitle" />
            <Field label="Subtítulo" name="heroSubtitle" />
            <Field label="Texto del botón" name="heroCtaText" />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--clr-bark)", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Imágenes del carrusel (reemplaza todas)
            </label>
            <input type="file" accept="image/*" multiple onChange={(e) => setHeroImages([...e.target.files])} />
          </div>
        </div>

        {/* About */}
        <div className="admin-form-section">
          <h3>📖 Sección "Sobre nosotros"</h3>
          <div className="admin-form">
            <div className="admin-form-row">
              <Field label="Título" name="aboutTitle" />
              <Field label="Subtítulo" name="aboutHeadline" />
            </div>
            <Field label="Cuerpo del texto" name="aboutBody" rows={4} />
            <Field label="Texto del botón 'Leer más'" name="aboutReadMoreText" />
            <Field label="Contenido expandido" name="aboutReadMoreContent" rows={5} />
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--clr-bark)", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Imagen de la sección (reemplaza la actual)
              </label>
              {homepage?.about?.image && (
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--clr-bark-light)" }}>Imagen actual: </span>
                  <a 
                    href={`${API}${homepage.about.image}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ fontSize: "0.85rem", color: "var(--clr-earth)", textDecoration: "underline" }}
                  >
                    Ver imagen
                  </a>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => setAboutImage(e.target.files[0])} />
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="admin-form-section">
          <h3>📧 Newsletter</h3>
          <div className="admin-form admin-form-row">
            <Field label="Título" name="newsletterTitle" />
            <Field label="Subtítulo" name="newsletterSubtitle" />
          </div>
        </div>

        {/* Contact */}
        <div className="admin-form-section">
          <h3>📞 Contacto (Footer)</h3>
          <div className="admin-form">
            <div className="admin-form-row">
              <Field label="Correo electrónico" name="contactEmail" type="email" />
              <Field label="Teléfono" name="contactPhone" />
            </div>
            <Field label="URL de Instagram" name="contactInstagram" />
          </div>
        </div>

        <button type="submit" className="admin-save-homepage-btn" disabled={saving}>
          {saving ? "Guardando…" : "Guardar todos los cambios"}
        </button>
      </form>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────
export default function AdminPanel() {
  const { adminToken, logout } = useData();
  const [tab, setTab] = useState("products");
  const [loggedIn, setLoggedIn] = useState(!!adminToken);

  useEffect(() => {
    setLoggedIn(!!adminToken);
  }, [adminToken]);

  if (!loggedIn) {
    return <AdminLogin onLogin={() => setLoggedIn(true)} />;
  }

  const tabs = [
    { id: "products", label: "Productos", icon: "📦" },
    { id: "blog", label: "Journal", icon: "✍️" },
    { id: "homepage", label: "Página principal", icon: "🏠" },
  ];

  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          enramá<span>Admin Panel</span>
        </div>

        {tabs.map((t) => (
          <button
            key={t.id}
            className={`admin-nav-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}

        <button
          className="admin-logout-btn"
          onClick={() => { logout(); setLoggedIn(false); }}
        >
          <span>↩</span> Cerrar sesión
        </button>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        {tab === "products" && <ProductsTab />}
        {tab === "blog" && <BlogTab />}
        {tab === "homepage" && <HomepageTab />}
      </main>
    </div>
  );
}
