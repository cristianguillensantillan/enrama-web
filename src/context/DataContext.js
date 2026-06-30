import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [homepage, setHomepage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminToken, setAdminToken] = useState(
    () => localStorage.getItem("enrama_admin_token") || null
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, bRes, hRes] = await Promise.all([
        fetch(`${API}/api/products`),
        fetch(`${API}/api/posts`),
        fetch(`${API}/api/homepage`),
      ]);
      if (pRes.ok) setProducts(await pRes.json());
      if (bRes.ok) setPosts(await bRes.json());
      if (hRes.ok) setHomepage(await hRes.json());
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Admin auth ──────────────────────────────────
  const login = async (username, password) => {
    const res = await fetch(`${API}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setAdminToken(data.token);
      localStorage.setItem("enrama_admin_token", data.token);
      return { ok: true };
    }
    return { ok: false, message: data.message };
  };

  const logout = () => {
    setAdminToken(null);
    localStorage.removeItem("enrama_admin_token");
  };

  const authHeaders = () => ({
    Authorization: `Bearer ${adminToken}`,
  });

  // ── Products CRUD ────────────────────────────────
  const createProduct = async (formData) => {
    const res = await fetch(`${API}/api/products`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });
    if (res.ok) { await fetchAll(); return { ok: true }; }
    return { ok: false, message: (await res.json()).message };
  };

  const updateProduct = async (id, formData) => {
    const res = await fetch(`${API}/api/products/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: formData,
    });
    if (res.ok) { await fetchAll(); return { ok: true }; }
    return { ok: false, message: (await res.json()).message };
  };

  const deleteProduct = async (id) => {
    const res = await fetch(`${API}/api/products/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    });
    if (res.ok) { await fetchAll(); return { ok: true }; }
    return { ok: false };
  };

  const reorderProducts = async (ids) => {
    const res = await fetch(`${API}/api/products/reorder`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (res.ok) { await fetchAll(); return { ok: true }; }
    return { ok: false, message: (await res.json()).message };
  };

  // ── Posts CRUD ──────────────────────────────────
  const createPost = async (formData) => {
    const res = await fetch(`${API}/api/posts`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });
    if (res.ok) { await fetchAll(); return { ok: true }; }
    return { ok: false, message: (await res.json()).message };
  };

  const updatePost = async (id, formData) => {
    const res = await fetch(`${API}/api/posts/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: formData,
    });
    if (res.ok) { await fetchAll(); return { ok: true }; }
    return { ok: false, message: (await res.json()).message };
  };

  const deletePost = async (id) => {
    const res = await fetch(`${API}/api/posts/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
    });
    if (res.ok) { await fetchAll(); return { ok: true }; }
    return { ok: false };
  };

  // ── Homepage ─────────────────────────────────────
  const updateHomepage = async (formData) => {
    const res = await fetch(`${API}/api/homepage`, {
      method: "PUT",
      headers: authHeaders(),
      body: formData,
    });
    if (res.ok) { await fetchAll(); return { ok: true }; }
    return { ok: false, message: (await res.json()).message };
  };

  // ── Orders ───────────────────────────────────────
  const sendOrder = async (producto, cliente) => {
    const res = await fetch(`${API}/send-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ producto, cliente }),
    });
    return res.ok
      ? { ok: true }
      : { ok: false, message: (await res.json()).message };
  };

  const sendNewsletter = async (email) => {
    const res = await fetch(`${API}/send-newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return res.ok ? { ok: true } : { ok: false };
  };

  return (
    <DataContext.Provider value={{
      products, posts, homepage, loading, adminToken,
      login, logout,
      createProduct, updateProduct, deleteProduct, reorderProducts,
      createPost, updatePost, deletePost,
      updateHomepage,
      sendOrder, sendNewsletter,
      API,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
