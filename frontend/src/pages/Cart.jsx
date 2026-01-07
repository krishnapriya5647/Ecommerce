import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setLoading(true);
      const res = await api.get("/api/cart/");
      setCart(res.data);
    } catch (err) {
      console.log("Cart load error:", err);
      if (err?.response?.status === 401) {
        setError("You’re not logged in. Please login to view your cart.");
      } else {
        setError("Could not load cart. Make sure Django server is running.");
      }
      setCart(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateQty(itemId, quantity) {
    try {
      setBusyItemId(itemId);
      setError("");

      if (quantity <= 0) {
        await api.delete(`/api/cart/items/${itemId}/delete/`);
      } else {
        await api.patch(`/api/cart/items/${itemId}/`, { quantity });
      }
      await load();
    } catch (err) {
      console.log("Update qty error:", err);
      setError(err?.response?.data?.detail || "Could not update quantity.");
    } finally {
      setBusyItemId(null);
    }
  }

  async function remove(itemId) {
    try {
      setBusyItemId(itemId);
      setError("");
      await api.delete(`/api/cart/items/${itemId}/delete/`);
      await load();
    } catch (err) {
      console.log("Remove error:", err);
      setError("Could not remove item.");
    } finally {
      setBusyItemId(null);
    }
  }

  const items = cart?.items || [];

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, it) => sum + Number(it.price_snapshot) * Number(it.quantity),
      0
    );
  }, [items]);

  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  if (loading) return <div className="card card-pad">Loading your cart…</div>;

  return (
    <div className="grid grid-2">
      {/* Left: Items */}
      <div className="card card-pad">
        <h2 className="section-title">Your Cart</h2>
        <p className="muted" style={{ marginTop: -6 }}>
          Review items, adjust quantity, then checkout.
        </p>

        {error && (
          <div className="notice" style={{ marginTop: 12 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 14 }} />

        {items.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              Your cart is empty 🛒
            </div>
            <div className="muted" style={{ marginBottom: 16 }}>
              Add a few items and come back here.
            </div>
            <Link className="btn btn-primary" to="/">
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            {items.map((it) => {
              const busy = busyItemId === it.id;
              return (
                <div key={it.id} className="cart-item" style={{ marginBottom: 12 }}>
                  <div className="cart-left">
                    <div className="cart-name">{it.product?.name || "Product"}</div>
                    <div className="cart-price">₹{it.price_snapshot} each</div>
                    <div style={{ marginTop: 10 }}>
                      <span className="pill">
                        Item total: ₹{Number(it.price_snapshot) * Number(it.quantity)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                    <div className="qty">
                      <button
                        className="qty-btn"
                        disabled={busy}
                        onClick={() => updateQty(it.id, it.quantity - 1)}
                        title="Decrease"
                      >
                        −
                      </button>
                      <div className="qty-num">{it.quantity}</div>
                      <button
                        className="qty-btn"
                        disabled={busy}
                        onClick={() => updateQty(it.id, it.quantity + 1)}
                        title="Increase"
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="btn btn-danger"
                      disabled={busy}
                      onClick={() => remove(it.id)}
                    >
                      Remove
                    </button>

                    {busy && <span className="muted" style={{ fontSize: 12 }}>Updating…</span>}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Right: Summary */}
      <div className="card card-pad" style={{ position: "sticky", top: 90, height: "fit-content" }}>
        <h3 className="section-title" style={{ fontSize: 18 }}>Order Summary</h3>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="muted">Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <span className="muted">Shipping</span>
          <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
        </div>

        <div className="hr" />

        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        <div style={{ marginTop: 14 }} />

        <Link
          to="/checkout"
          className={`btn btn-primary`}
          style={{ width: "100%" }}
        >
          Proceed to Checkout
        </Link>

        <Link
          to="/"
          className="btn"
          style={{ width: "100%", marginTop: 10 }}
        >
          Continue Shopping
        </Link>

        <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>
          (Payment comes later — right now checkout creates an order in DB.)
        </p>
      </div>
    </div>
  );
}
