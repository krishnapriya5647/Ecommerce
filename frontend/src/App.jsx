import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";


export default function App() {
  return (
    <BrowserRouter>
      <div className="shell">
        <header className="header">
          <div className="container header-inner">
            <Link to="/" className="brand">
              <span>UpCart</span>
            </Link>

            <nav className="nav">
              <Link to="/">Shop</Link>
              <Link to="/cart">Cart</Link>
              <Link to="/checkout">Checkout</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>

            </nav>
          </div>
        </header>

        <main className="container" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

          </Routes>
        </main>
        <footer className="footer">
  <div className="footer-inner">
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span className="brand-badge" />
        <h3 className="footer-title" style={{ margin: 0 }}>UpCart</h3>
      </div>
      <p>
        Your trusted place for quality products at great prices. Shop smarter, faster, and safer.
      </p>
    </div>

    <div>
      <h4 className="footer-title">Shop</h4>
      <ul>
        <li><a href="/">All Products</a></li>
        <li><a href="/cart">Cart</a></li>
        <li><a href="/checkout">Checkout</a></li>
      </ul>
    </div>

    <div>
      <h4 className="footer-title">Support</h4>
      <ul>
        <li><a href="#">Help Center</a></li>
        <li><a href="#">Shipping</a></li>
        <li><a href="#">Returns</a></li>
      </ul>
    </div>

    <div>
      <h4 className="footer-title">Company</h4>
      <ul>
        <li><a href="#">About</a></li>
        <li><a href="#">Privacy Policy</a></li>
        <li><a href="#">Terms</a></li>
      </ul>
    </div>
  </div>

  <div className="footer-bottom">
    <span>© {new Date().getFullYear()} UpCart. All rights reserved.</span>
    <span>Made with ❤️ for your e-commerce project</span>
  </div>
</footer>

      </div>
    </BrowserRouter>
  );
}
