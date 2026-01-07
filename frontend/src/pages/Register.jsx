import { useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    try {
      setBusy(true);
      setErrorMsg("");

      // ✅ Your backend must have /api/auth/register/
      await api.post("/api/auth/register/", { username, email, password });

      // auto-login after register (optional)
      const res = await api.post("/api/auth/login/", { username, password });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      nav("/");
    } catch (err) {
      console.log("Register error:", err);
      const data = err?.response?.data;

      // Show DRF validation errors nicely
      if (data && typeof data === "object") {
        const msg =
          data.detail ||
          data.username?.[0] ||
          data.email?.[0] ||
          data.password?.[0] ||
          "Registration failed.";
        setErrorMsg(String(msg));
      } else {
        setErrorMsg("Registration failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card card-pad" style={{ maxWidth: 460, margin: "10px auto" }}>
      <h2 className="section-title">Create account</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        Join UpCart to add items to cart and checkout.
      </p>

      {errorMsg && <div className="notice" style={{ marginTop: 12 }}>{errorMsg}</div>}

      <form onSubmit={handleRegister} className="grid" style={{ marginTop: 14 }}>
        <input
          className="input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="input"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary" disabled={busy} type="submit">
          {busy ? "Creating…" : "Create account"}
        </button>

        <Link to="/login" className="btn">Already have an account? Login</Link>
      </form>
    </div>
  );
}
