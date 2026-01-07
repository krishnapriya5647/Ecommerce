import { useEffect, useMemo, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const [toast, setToast] = useState("");
  const [busyId, setBusyId] = useState(null);

  // ✅ Change this hero image to any image you like
  const HERO_IMAGE =
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80";

  async function load() {
    try {
      setError("");
      setLoading(true);

      const [prodRes, catRes] = await Promise.all([
        api.get("/api/products/"),
        api.get("/api/categories/"),
      ]);

      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.log("Products load error:", err);
      setError("Could not load products. Make sure Django server is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return products.filter((p) => {
      const matchesQuery =
        !query ||
        (p.name || "").toLowerCase().includes(query) ||
        (p.description || "").toLowerCase().includes(query);

      const matchesCategory = cat === "all" || p.category?.slug === cat;

      return matchesQuery && matchesCategory;
    });
  }, [products, q, cat]);

  // ✅ keep products in a stable order
  const ordered = useMemo(() => {
    return [...filtered].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    // If you want alphabetic:
    // return [...filtered].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [filtered]);

  function getPrimaryImage(p) {
    const imgs = p.images || [];
    const primary = imgs.find((x) => x.is_primary) || imgs[0];
    return (
      primary?.image_url ||
      `https://picsum.photos/seed/${encodeURIComponent(p.slug || p.id)}/900/700`
    );
  }

  async function addToCart(productId) {
    try {
      setBusyId(productId);
      setToast("");
      await api.post("/api/cart/items/add/", { product_id: productId, quantity: 1 });

      setToast("Added to cart ✅");
      setTimeout(() => setToast(""), 1400);
    } catch (err) {
      console.log("Add to cart error:", err);
      if (err?.response?.status === 401) {
        setToast("Please login to add items 🙂");
      } else if (err?.response?.data?.detail) {
        setToast(err.response.data.detail);
      } else {
        setToast("Could not add to cart.");
      }
      setTimeout(() => setToast(""), 1800);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {/* HERO */}
      <div
        className="hero"
        style={{ backgroundImage: `url(${HERO_IMAGE})`, marginBottom: 14 }}
      >
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-title">Shop smarter. Live better.</div>
            <p className="hero-sub">
              Discover trending products, add to cart, and checkout in seconds — like a real store.
            </p>

            <div className="hero-actions">
              <a href="#products" className="btn btn-primary">
                Shop now
              </a>
              <Link to="/cart" className="btn">
                View cart
              </Link>
            </div>

            {toast && (
              <div style={{ marginTop: 12 }} className="pill">
                {toast}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="card card-pad" style={{ marginBottom: 14 }}>
        <div className="section-row">
          <div>
            <h2 className="section-title" style={{ marginBottom: 6 }}>
              Categories
            </h2>
            <p className="muted" style={{ margin: 0 }}>
              Tap a category to filter products.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              className="input"
              style={{ width: 320, maxWidth: "100%" }}
              placeholder="Search products…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 12 }} className="chips">
          <button
            className={`chip ${cat === "all" ? "active" : ""}`}
            onClick={() => setCat("all")}
          >
            All
          </button>

          {categories.map((c) => (
            <button
              key={c.id}
              className={`chip ${cat === c.slug ? "active" : ""}`}
              onClick={() => setCat(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {error && <div className="notice" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      {/* PRODUCTS */}
      <div id="products" className="card card-pad">
        <div className="section-row" style={{ marginBottom: 10 }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 6 }}>
              Products
            </h2>
            <p className="muted" style={{ margin: 0 }}>
              {loading ? "Loading…" : `${ordered.length} items found`}
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/checkout" className="btn btn-primary">
              Checkout
            </Link>
            <Link to="/cart" className="btn">
              Cart
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading products…</p>
        ) : ordered.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
              No products found
            </div>
            <div className="muted">Try another category or search.</div>
          </div>
        ) : (
          <div className="product-grid" style={{ marginTop: 12 }}>
            {ordered.map((p) => {
              const img = getPrimaryImage(p);
              const outOfStock = Number(p.stock) <= 0;
              const busy = busyId === p.id;

              return (
                <div key={p.id} className="card product-card">
                  <div className="product-media">
                    <img className="product-img" src={img} alt={p.name} />
                  </div>

                  <div className="product-body">
                    <h3 className="product-title">{p.name}</h3>

                    <div className="product-desc">
                      {p.description || "Great quality, great price."}
                    </div>

                    <div className="product-meta">
                      <span className="pill">{p.category?.name || "Category"}</span>
                      <span className="pill">
                        {outOfStock ? "Out of stock" : `Stock: ${p.stock}`}
                      </span>
                    </div>

                    <div className="product-price">₹{p.price}</div>

                    <div className="product-actions">
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        disabled={outOfStock || busy}
                        onClick={() => addToCart(p.id)}
                      >
                        {busy ? "Adding…" : "Add to cart"}
                      </button>

                      <Link className="btn" to="/cart">
                        Cart
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
