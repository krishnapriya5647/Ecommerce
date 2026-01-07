import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    city: "",
    pincode: "",
  });

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function placeOrder(e) {
    e.preventDefault();
    try {
      setBusy(true);
      setError("");
      const res = await api.post("/api/checkout/", form);
      alert(`Order placed ✅  Order ID: ${res.data.id}`);
      nav("/"); // later we can navigate to /orders
    } catch (err) {
      setError(err?.response?.data?.detail || "Checkout failed. Are you logged in?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-2">
      <div className="card card-pad">
        <h2 className="section-title">Checkout</h2>
        <p className="muted" style={{ marginTop: -6 }}>
          Enter delivery details to place your order.
        </p>

        {error && <div className="notice" style={{ marginTop: 12 }}>{error}</div>}

        <form onSubmit={placeOrder} style={{ marginTop: 14 }} className="grid">
          <input className="input" name="full_name" placeholder="Full name"
            value={form.full_name} onChange={onChange} />

          <input className="input" name="phone" placeholder="Phone"
            value={form.phone} onChange={onChange} />

          <input className="input" name="address_line1" placeholder="Address"
            value={form.address_line1} onChange={onChange} />

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input className="input" name="city" placeholder="City"
              value={form.city} onChange={onChange} />
            <input className="input" name="pincode" placeholder="Pincode"
              value={form.pincode} onChange={onChange} />
          </div>

          <button className="btn btn-primary" disabled={busy} type="submit">
            {busy ? "Placing order…" : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
