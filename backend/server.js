import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────────
// Static file serving for uploads
// ──────────────────────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// ──────────────────────────────────────────────
// Multer config
// ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ──────────────────────────────────────────────
// Data helpers
// ──────────────────────────────────────────────
const dataDir = path.join(__dirname, "data");
const readJSON = (file) => JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));
const writeJSON = (file, data) =>
  fs.writeFileSync(path.join(dataDir, file), JSON.stringify(data, null, 2));

// ──────────────────────────────────────────────
// Auth middleware
// ──────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token && token === process.env.ADMIN_TOKEN) return next();
  res.status(401).json({ message: "No autorizado" });
};

// ──────────────────────────────────────────────
// Nodemailer transporter
// ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
});

// ══════════════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════════════

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    res.json({ token: process.env.ADMIN_TOKEN, message: "Autenticado" });
  } else {
    res.status(401).json({ message: "Credenciales incorrectas" });
  }
});

// ══════════════════════════════════════════════
// PRODUCTS ROUTES
// ══════════════════════════════════════════════

app.get("/api/products", (req, res) => {
  try {
    res.json(readJSON("products.json"));
  } catch {
    res.status(500).json({ message: "Error al leer productos" });
  }
});

app.post("/api/products", requireAdmin, upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 10 },
  { name: "colorIcon1", maxCount: 1 },
  { name: "colorIcon2", maxCount: 1 },
  { name: "colorIcon3", maxCount: 1 },
]), (req, res) => {
  try {
    const products = readJSON("products.json");
    const mainImage = req.files?.image?.[0]?.filename
      ? `/uploads/${req.files.image[0].filename}`
      : "/uploads/placeholder.jpg";
    const extraImages = req.files?.images?.map((f) => `/uploads/${f.filename}`) || [mainImage];

    const colorIcon1 = req.files?.colorIcon1?.[0]?.filename ? `/uploads/${req.files.colorIcon1[0].filename}` : null;
    const colorIcon2 = req.files?.colorIcon2?.[0]?.filename ? `/uploads/${req.files.colorIcon2[0].filename}` : null;
    const colorIcon3 = req.files?.colorIcon3?.[0]?.filename ? `/uploads/${req.files.colorIcon3[0].filename}` : null;

    const woodName1 = req.body.woodName1 || "";
    const woodName2 = req.body.woodName2 || "";
    const woodName3 = req.body.woodName3 || "";

    const woodPrice1 = req.body.woodPrice1 || "";
    const woodPrice2 = req.body.woodPrice2 || "";
    const woodPrice3 = req.body.woodPrice3 || "";

    const colors = [];
    if (colorIcon1 || woodName1 || woodPrice1) colors.push({ icon: colorIcon1, name: woodName1, price: woodPrice1 });
    if (colorIcon2 || woodName2 || woodPrice2) colors.push({ icon: colorIcon2, name: woodName2, price: woodPrice2 });
    if (colorIcon3 || woodName3 || woodPrice3) colors.push({ icon: colorIcon3, name: woodName3, price: woodPrice3 });

    const newProduct = {
      id: Date.now().toString(),
      name: req.body.name,
      price: req.body.price,
      info: req.body.info,
      material: req.body.material,
      dimensiones: req.body.dimensiones,
      featured: req.body.featured === "true",
      image: mainImage,
      images: [mainImage, ...extraImages],
      colors: colors,
      createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    writeJSON("products.json", products);
    res.status(201).json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear producto" });
  }
});

app.put("/api/products/reorder", requireAdmin, (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: "Se requiere un arreglo de IDs" });
    }
    const products = readJSON("products.json");
    const ordered = [];
    ids.forEach((id) => {
      const p = products.find((prod) => prod.id === id);
      if (p) ordered.push(p);
    });
    // Add any remaining products just in case
    products.forEach((p) => {
      if (!ordered.some((o) => o.id === p.id)) {
        ordered.push(p);
      }
    });
    writeJSON("products.json", ordered);
    res.json(ordered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al reordenar productos" });
  }
});

app.put("/api/products/:id", requireAdmin, upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 10 },
  { name: "colorIcon1", maxCount: 1 },
  { name: "colorIcon2", maxCount: 1 },
  { name: "colorIcon3", maxCount: 1 },
]), (req, res) => {
  try {
    const products = readJSON("products.json");
    const idx = products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Producto no encontrado" });

    const existing = products[idx];
    const existingColors = existing.colors || [];

    const mainImage = req.files?.image?.[0]?.filename
      ? `/uploads/${req.files.image[0].filename}`
      : existing.image;
    const extraImages = req.files?.images?.length
      ? req.files.images.map((f) => `/uploads/${f.filename}`)
      : existing.images;

    const getExistingIcon = (val) => {
      if (!val) return null;
      if (typeof val === 'string') return val;
      return val.icon || null;
    };

    const getExistingName = (val) => {
      if (!val) return "";
      if (typeof val === 'string') return "";
      return val.name || "";
    };

    const getExistingPrice = (val) => {
      if (!val) return "";
      if (typeof val === 'string') return "";
      return val.price || "";
    };

    const colorIcon1 = req.files?.colorIcon1?.[0]?.filename
      ? `/uploads/${req.files.colorIcon1[0].filename}`
      : getExistingIcon(existingColors[0]);
    const colorIcon2 = req.files?.colorIcon2?.[0]?.filename
      ? `/uploads/${req.files.colorIcon2[0].filename}`
      : getExistingIcon(existingColors[1]);
    const colorIcon3 = req.files?.colorIcon3?.[0]?.filename
      ? `/uploads/${req.files.colorIcon3[0].filename}`
      : getExistingIcon(existingColors[2]);

    const woodName1 = req.body.woodName1 !== undefined ? req.body.woodName1 : getExistingName(existingColors[0]);
    const woodName2 = req.body.woodName2 !== undefined ? req.body.woodName2 : getExistingName(existingColors[1]);
    const woodName3 = req.body.woodName3 !== undefined ? req.body.woodName3 : getExistingName(existingColors[2]);

    const woodPrice1 = req.body.woodPrice1 !== undefined ? req.body.woodPrice1 : getExistingPrice(existingColors[0]);
    const woodPrice2 = req.body.woodPrice2 !== undefined ? req.body.woodPrice2 : getExistingPrice(existingColors[1]);
    const woodPrice3 = req.body.woodPrice3 !== undefined ? req.body.woodPrice3 : getExistingPrice(existingColors[2]);

    const colors = [];
    if (colorIcon1 || woodName1 || woodPrice1) colors.push({ icon: colorIcon1, name: woodName1, price: woodPrice1 });
    if (colorIcon2 || woodName2 || woodPrice2) colors.push({ icon: colorIcon2, name: woodName2, price: woodPrice2 });
    if (colorIcon3 || woodName3 || woodPrice3) colors.push({ icon: colorIcon3, name: woodName3, price: woodPrice3 });

    products[idx] = {
      ...existing,
      name: req.body.name ?? existing.name,
      price: req.body.price ?? existing.price,
      info: req.body.info ?? existing.info,
      material: req.body.material ?? existing.material,
      dimensiones: req.body.dimensiones ?? existing.dimensiones,
      featured: req.body.featured !== undefined ? req.body.featured === "true" : existing.featured,
      image: mainImage,
      images: extraImages,
      colors: colors,
    };
    writeJSON("products.json", products);
    res.json(products[idx]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
});

app.delete("/api/products/:id", requireAdmin, (req, res) => {
  try {
    const products = readJSON("products.json");
    const filtered = products.filter((p) => p.id !== req.params.id);
    writeJSON("products.json", filtered);
    res.json({ message: "Producto eliminado" });
  } catch {
    res.status(500).json({ message: "Error al eliminar producto" });
  }
});

// ══════════════════════════════════════════════
// BLOG POSTS ROUTES
// ══════════════════════════════════════════════

app.get("/api/posts", (req, res) => {
  try {
    res.json(readJSON("posts.json"));
  } catch {
    res.status(500).json({ message: "Error al leer posts" });
  }
});

app.get("/api/posts/:id", (req, res) => {
  try {
    const posts = readJSON("posts.json");
    const post = posts.find((p) => p.id === req.params.id);
    if (!post) return res.status(404).json({ message: "Post no encontrado" });
    res.json(post);
  } catch {
    res.status(500).json({ message: "Error al leer post" });
  }
});

app.post("/api/posts", requireAdmin, upload.single("coverImage"), (req, res) => {
  try {
    const posts = readJSON("posts.json");
    const coverImage = req.file
      ? `/uploads/${req.file.filename}`
      : "/uploads/placeholder.jpg";

    const newPost = {
      id: Date.now().toString(),
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      author: req.body.author || "Enramá",
      tags: req.body.tags ? req.body.tags.split(",").map((t) => t.trim()) : [],
      coverImage,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    posts.unshift(newPost);
    writeJSON("posts.json", posts);
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear post" });
  }
});

app.put("/api/posts/:id", requireAdmin, upload.single("coverImage"), (req, res) => {
  try {
    const posts = readJSON("posts.json");
    const idx = posts.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: "Post no encontrado" });

    const existing = posts[idx];
    const coverImage = req.file
      ? `/uploads/${req.file.filename}`
      : existing.coverImage;

    posts[idx] = {
      ...existing,
      title: req.body.title ?? existing.title,
      excerpt: req.body.excerpt ?? existing.excerpt,
      content: req.body.content ?? existing.content,
      author: req.body.author ?? existing.author,
      tags: req.body.tags ? req.body.tags.split(",").map((t) => t.trim()) : existing.tags,
      coverImage,
    };
    writeJSON("posts.json", posts);
    res.json(posts[idx]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar post" });
  }
});

app.delete("/api/posts/:id", requireAdmin, (req, res) => {
  try {
    const posts = readJSON("posts.json");
    const filtered = posts.filter((p) => p.id !== req.params.id);
    writeJSON("posts.json", filtered);
    res.json({ message: "Post eliminado" });
  } catch {
    res.status(500).json({ message: "Error al eliminar post" });
  }
});

// ══════════════════════════════════════════════
// HOMEPAGE ROUTES
// ══════════════════════════════════════════════

app.get("/api/homepage", (req, res) => {
  try {
    res.json(readJSON("homepage.json"));
  } catch {
    res.status(500).json({ message: "Error al leer homepage" });
  }
});

app.put("/api/homepage", requireAdmin, upload.fields([
  { name: "heroImages", maxCount: 15 },
  { name: "aboutImages", maxCount: 10 },
  { name: "logo", maxCount: 1 },
]), (req, res) => {
  try {
    const current = readJSON("homepage.json");
    
    let heroImages = [];
    if (req.body.heroImagesMetadata) {
      try {
        const metadata = JSON.parse(req.body.heroImagesMetadata);
        const uploadedFiles = req.files?.heroImages || [];
        metadata.forEach((item) => {
          if (item.type === "existing") {
            heroImages.push({
              url: item.url,
              position: item.position || "center",
            });
          } else if (item.type === "new") {
            const file = uploadedFiles[item.fileIndex];
            if (file) {
              heroImages.push({
                url: `/uploads/${file.filename}`,
                position: item.position || "center",
              });
            }
          }
        });
      } catch (err) {
        console.error("Error parsing heroImagesMetadata:", err);
        heroImages = req.files?.heroImages?.length
          ? req.files.heroImages.map((f) => ({ url: `/uploads/${f.filename}`, position: "center" }))
          : current.hero.images;
      }
    } else {
      if (req.files?.heroImages?.length) {
        heroImages = req.files.heroImages.map((f) => ({ url: `/uploads/${f.filename}`, position: "center" }));
      } else {
        heroImages = (current.hero.images || []).map((img) =>
          typeof img === "string" ? { url: img, position: "center" } : img
        );
      }
    }

    const aboutImages = req.files?.aboutImages?.length
      ? req.files.aboutImages.map((f) => `/uploads/${f.filename}`)
      : current.about?.images || (current.about?.image ? [current.about.image] : []);

    const logo = req.files?.logo?.[0]?.filename
      ? `/uploads/${req.files.logo[0].filename}`
      : current.logo || "";

    const updated = {
      logo: logo,
      hero: {
        title: req.body.heroTitle ?? current.hero.title,
        subtitle: req.body.heroSubtitle ?? current.hero.subtitle,
        ctaText: req.body.heroCtaText ?? current.hero.ctaText,
        images: heroImages,
      },
      about: {
        title: req.body.aboutTitle ?? current.about.title,
        headline: req.body.aboutHeadline ?? current.about.headline,
        body: req.body.aboutBody ?? current.about.body,
        readMoreText: req.body.aboutReadMoreText ?? current.about.readMoreText,
        readMoreContent: req.body.aboutReadMoreContent ?? current.about.readMoreContent,
        images: aboutImages,
        image: aboutImages[0] || "",
      },
      newsletter: {
        title: req.body.newsletterTitle ?? current.newsletter.title,
        subtitle: req.body.newsletterSubtitle ?? current.newsletter.subtitle,
      },
      contact: {
        email: req.body.contactEmail ?? current.contact.email,
        phone: req.body.contactPhone ?? current.contact.phone,
        instagram: req.body.contactInstagram ?? current.contact.instagram,
      },
    };
    writeJSON("homepage.json", updated);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar homepage" });
  }
});

// ══════════════════════════════════════════════
// IMAGE UPLOAD STANDALONE
// ══════════════════════════════════════════════
app.post("/api/upload", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No se subió archivo" });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ══════════════════════════════════════════════
// EMAIL ROUTES
// ══════════════════════════════════════════════

app.post("/send-newsletter", async (req, res) => {
  const { email } = req.body;
  try {
    await transporter.sendMail({
      from: `"Enramá Newsletter" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "Nueva suscripción al Newsletter",
      text: `Un nuevo usuario se suscribió con el correo: ${email}`,
    });
    res.status(200).json({ message: "Suscripción enviada con éxito" });
  } catch (error) {
    console.error("Error enviando newsletter:", error);
    res.status(500).json({ message: "Error al enviar la suscripción" });
  }
});

app.post("/send-order", async (req, res) => {
  const { producto, cliente } = req.body;

  let logoUrl = null;
  try {
    const homepage = readJSON("homepage.json");
    if (homepage?.logo) {
      logoUrl = `${req.protocol}://${req.get("host")}${homepage.logo}`;
    }
  } catch (err) {
    console.error("Error reading logo from homepage.json:", err);
  }

  const ownerMail = {
    from: `"Enramá Órdenes" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `Nueva orden: ${producto.name}`,
    html: `
      <div style="font-family: 'Montserrat', sans-serif; background-color: #f7f3ee; padding: 40px 20px; color: #1e1512;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(30,21,18,0.05); border: 1px solid #e8dfd4;">
          
          <!-- Header with Logo & Brand -->
          <div style="background-color: #1e1512; padding: 32px 24px; text-align: center; border-bottom: 3px solid #a67c52;">
            <img src="cid:enramalogo" alt="enramá" style="height: 50px; width: auto; display: block; margin: 0 auto 12px; object-fit: contain;" />
            <h1 style="color: #ffffff; font-size: 1.8rem; font-weight: normal; margin: 0; letter-spacing: 3px; text-transform: uppercase;">enramá</h1>
            <p style="color: #c9b9a7; font-size: 0.85rem; margin: 6px 0 0; letter-spacing: 1.5px; text-transform: uppercase;">Nueva Orden Recibida</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 40px 32px;">
            <h2 style="color: #1e1512; font-size: 1.4rem; font-weight: normal; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #e8dfd4; padding-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
              📦 Detalles de la Orden
            </h2>
            
            <!-- Product Details Box -->
            <div style="background-color: #f7f3ee; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid #e8dfd4;">
              <h3 style="color: #8b6f5e; font-size: 1.05rem; font-weight: normal; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;">
                Producto Solicitado
              </h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
                <tr style="border-bottom: 1px solid #e8dfd4;"><td style="padding: 8px 0; color: #8b6f5e;">Nombre</td><td style="padding: 8px 0; text-align: right; color: #1e1512;"><strong>${producto.name}</strong></td></tr>
                <tr style="border-bottom: 1px solid #e8dfd4;"><td style="padding: 8px 0; color: #8b6f5e;">Precio</td><td style="padding: 8px 0; text-align: right; color: #a67c52;"><strong>${producto.price}</strong></td></tr>
                <tr style="border-bottom: 1px solid #e8dfd4;"><td style="padding: 8px 0; color: #8b6f5e;">Cantidad</td><td style="padding: 8px 0; text-align: right; color: #1e1512;"><strong>${cliente.cantidad}</strong></td></tr>
                <tr style="border-bottom: 1px solid #e8dfd4;"><td style="padding: 8px 0; color: #8b6f5e;">Material</td><td style="padding: 8px 0; text-align: right; color: #1e1512;">${producto.material || "N/A"}</td></tr>
                <tr style="border-bottom: 1px solid #e8dfd4;"><td style="padding: 8px 0; color: #8b6f5e;">Dimensiones</td><td style="padding: 8px 0; text-align: right; color: #1e1512;">${producto.dimensiones || "N/A"}</td></tr>
              </table>
            </div>

            <!-- Customer Details Box -->
            <div style="background-color: #ffffff; border-radius: 8px; padding: 24px; border: 1px solid #e8dfd4; margin-bottom: 24px;">
              <h3 style="color: #8b6f5e; font-size: 1.05rem; font-weight: normal; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;">
                Datos del Cliente
              </h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
                <tr style="border-bottom: 1px solid #e8dfd4;"><td style="padding: 8px 0; color: #8b6f5e;">Nombre</td><td style="padding: 8px 0; text-align: right; color: #1e1512;"><strong>${cliente.nombre}</strong></td></tr>
                <tr style="border-bottom: 1px solid #e8dfd4;"><td style="padding: 8px 0; color: #8b6f5e;">Teléfono</td><td style="padding: 8px 0; text-align: right; color: #1e1512;"><strong>${cliente.telefono}</strong></td></tr>
                <tr style="border-bottom: 1px solid #e8dfd4;"><td style="padding: 8px 0; color: #8b6f5e;">Correo</td><td style="padding: 8px 0; text-align: right; color: #1e1512;">${cliente.email || "No proporcionado"}</td></tr>
                <tr style="border-bottom: 1px solid #e8dfd4;"><td style="padding: 8px 0; color: #8b6f5e;">Dirección</td><td style="padding: 8px 0; text-align: right; color: #1e1512;">${cliente.direccion}</td></tr>
                <tr style="border-bottom: 1px solid #e8dfd4;"><td style="padding: 8px 0; color: #8b6f5e;">¿Requiere transporte?</td><td style="padding: 8px 0; text-align: right; color: #1e1512;"><strong>${cliente.requiereTransporte ? "Sí 🚚" : "No"}</strong></td></tr>
                <tr style="border-bottom: 1px solid #e8dfd4;"><td style="padding: 8px 0; color: #8b6f5e;">¿Requiere factura fiscal?</td><td style="padding: 8px 0; text-align: right; color: #1e1512;"><strong>${cliente.requiereFactura ? "Sí 📄" : "No"}</strong></td></tr>
                ${cliente.notas ? `<tr><td style="padding: 8px 0; color: #8b6f5e;">Notas adicionales</td><td style="padding: 8px 0; text-align: right; color: #5c4033;">${cliente.notas}</td></tr>` : ""}
              </table>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #1e1512; padding: 24px; text-align: center; font-size: 0.8rem; color: #c9b9a7; border-top: 1px solid #a67c52;">
            Sistema de Notificaciones Automáticas - enramá
          </div>

        </div>
      </div>
    `,
    attachments: [
      {
        filename: "enrama-logo.png",
        path: path.join(__dirname, "enrama-logo.png"),
        cid: "enramalogo",
        disposition: "inline"
      }
    ]
  };

  try {
    await transporter.sendMail(ownerMail);

    // Send confirmation to customer if they provided an email
    if (cliente.email) {
      const customerMail = {
        from: `"Enramá" <${process.env.GMAIL_USER}>`,
        to: cliente.email,
        subject: `¡Tu orden de ${producto.name} fue recibida!`,
        html: `
          <div style="font-family: 'Montserrat', sans-serif; background-color: #f7f3ee; padding: 40px 20px; color: #1e1512;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(30,21,18,0.05); border: 1px solid #e8dfd4;">
              
              <!-- Header with Logo & Brand -->
              <div style="background-color: #1e1512; padding: 32px 24px; text-align: center; border-bottom: 3px solid #a67c52;">
                <img src="cid:enramalogo" alt="enramá" style="height: 50px; width: auto; display: block; margin: 0 auto 12px; object-fit: contain;" />
                <h1 style="color: #ffffff; font-size: 1.8rem; font-weight: normal; margin: 0; letter-spacing: 3px; text-transform: uppercase;">enramá</h1>
                <p style="color: #c9b9a7; font-size: 0.85rem; margin: 6px 0 0; letter-spacing: 1.5px; text-transform: uppercase;">Artesanía tradicional del Cibao</p>
              </div>

              <!-- Body Content -->
              <div style="padding: 40px 32px;">
                <h2 style="color: #1e1512; font-size: 1.4rem; font-weight: normal; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid #e8dfd4; padding-bottom: 12px;">
                  ✅ ¡Gracias por tu orden, ${cliente.nombre}!
                </h2>
                <p style="font-size: 0.95rem; line-height: 1.6; color: #5c4033; margin-bottom: 24px;">
                  Hemos recibido tu solicitud para adquirir una de nuestras piezas tradicionales del Cibao. Nos pondremos en contacto contigo a la brevedad por teléfono o correo para coordinar la entrega y los detalles del pago.
                </p>

                <!-- Order Details Box -->
                <div style="background-color: #f7f3ee; border-radius: 8px; padding: 24px; margin-bottom: 24px; border: 1px solid #e8dfd4;">
                  <h3 style="color: #8b6f5e; font-size: 1.05rem; font-weight: normal; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;">
                    Resumen de la orden
                  </h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
                    <tr style="border-bottom: 1px solid #e8dfd4;">
                      <td style="padding: 10px 0; color: #8b6f5e;">Producto</td>
                      <td style="padding: 10px 0; text-align: right; color: #1e1512;"><strong>${producto.name}</strong></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e8dfd4;">
                      <td style="padding: 10px 0; color: #8b6f5e;">Precio unitario</td>
                      <td style="padding: 10px 0; text-align: right; color: #a67c52;"><strong>${producto.price}</strong></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e8dfd4;">
                      <td style="padding: 10px 0; color: #8b6f5e;">Cantidad</td>
                      <td style="padding: 10px 0; text-align: right; color: #1e1512;">${cliente.cantidad}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e8dfd4;">
                      <td style="padding: 10px 0; color: #8b6f5e;">Transporte</td>
                      <td style="padding: 10px 0; text-align: right; color: #1e1512;">
                        <span style="background-color: ${cliente.requiereTransporte ? "#e8dfd4" : "transparent"}; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">
                          ${cliente.requiereTransporte ? "Solicitado 🚚" : "No requerido"}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #8b6f5e;">Factura Crédito Fiscal</td>
                      <td style="padding: 10px 0; text-align: right; color: #1e1512;">
                        <span style="background-color: ${cliente.requiereFactura ? "#e8dfd4" : "transparent"}; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem;">
                          ${cliente.requiereFactura ? "Solicitada 📄" : "No requerida"}
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Customer Contact Details -->
                <div style="margin-bottom: 32px;">
                  <h3 style="color: #1e1512; font-size: 1.1rem; font-weight: normal; margin-top: 0; margin-bottom: 12px;">Datos de contacto proporcionados:</h3>
                  <ul style="list-style-type: none; padding-left: 0; margin: 0; font-size: 0.9rem; color: #5c4033; line-height: 1.6;">
                    <li><strong>Teléfono:</strong> ${cliente.telefono}</li>
                    <li><strong>Dirección:</strong> ${cliente.direccion}</li>
                    ${cliente.notes || cliente.notas ? `<li><strong>Notas:</strong> ${cliente.notas}</li>` : ""}
                  </ul>
                </div>

                <!-- Call to Action / Help -->
                <div style="border-top: 1px solid #e8dfd4; padding-top: 24px; text-align: center; font-size: 0.9rem; color: #8b6f5e;">
                  ¿Tienes alguna duda sobre tu pedido? Escríbenos a 
                  <a href="mailto:${process.env.GMAIL_USER}" style="color: #a67c52; text-decoration: none; font-weight: bold;">
                    ${process.env.GMAIL_USER}
                  </a>
                </div>
              </div>

              <!-- Footer -->
              <div style="background-color: #1e1512; padding: 24px; text-align: center; font-size: 0.8rem; color: #c9b9a7; border-top: 1px solid #a67c52;">
                © ${new Date().getFullYear()} enramá. Todos los derechos reservados.<br/>
                Hecho a mano en el Cibao, República Dominicana.
              </div>

            </div>
          </div>
        `,
        attachments: [
          {
            filename: "enrama-logo.png",
            path: path.join(__dirname, "enrama-logo.png"),
            cid: "enramalogo",
            disposition: "inline"
          }
        ]
      };
      await transporter.sendMail(customerMail);
    }

    res.status(200).json({ message: "Orden enviada con éxito" });
  } catch (error) {
    console.error("Error enviando orden:", error);
    res.status(500).json({ 
      message: "Error al enviar la orden",
      error: error.message,
      stack: error.stack
    });
  }
});

// ──────────────────────────────────────────────
app.listen(process.env.PORT || 5001, () => {
  console.log(`✅ Servidor corriendo en puerto ${process.env.PORT || 5001}`);
});
