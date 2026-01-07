import { useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const nav = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setBusy(true);
      setErrorMsg("");

      const res = await api.post("/api/auth/login/", { username, password });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      nav("/");
    } catch (err) {
      console.log("Login error:", err);

      if (err?.response?.data?.detail) {
        setErrorMsg(err.response.data.detail);
      } else {
        setErrorMsg("Login failed. Check username/password.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card card-pad" style={{ maxWidth: 460, margin: "10px auto" }}>
      <h2 className="section-title">Welcome back</h2>

      {errorMsg && <div className="notice" style={{ marginTop: 12 }}>{errorMsg}</div>}

      <form onSubmit={handleLogin} className="grid" style={{ marginTop: 14 }}>
        <input
          className="input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary" disabled={busy} type="submit">
          {busy ? "Logging in…" : "Login"}
        </button>

        <Link to="/" className="btn">Back to shop</Link>
      </form>
    </div>
  );
}
