import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import rewearIcon from "../assets/rewear-icon.svg";
import "../components/Profile.css";

const stats = [
  { label: "Orders", value: "12", highlight: "This year" },
  { label: "Wishlist", value: "28", highlight: "Saved styles" },
  { label: "Rewards", value: "1.8k", highlight: "Points earned" },
  { label: "Returns", value: "02", highlight: "Easy claims" },
];

const recentOrders = [
  { id: "RW-2048", item: "Urban Layer Jacket", status: "Delivered", date: "14 Sep 2026" },
  { id: "RW-1987", item: "Velvet Bloom Dress", status: "Shipped", date: "27 Sep 2026" },
  { id: "RW-1842", item: "Sunny Sprout Set", status: "Processing", date: "05 Oct 2026" },
];

const savedItems = [
  { name: "Velvet Bloom Dress", price: "₹1,830", tag: "Outfit", tone: "gold" },
  { name: "Street Tee", price: "₹1,799", tag: "Outfit", tone: "olive" },
  { name: "Urban Layer Jacket", price: "₹1,999", tag: "Outfit", tone: "rose" },
];

const quickLinks = [
  { label: "New Arrivals", text: "Fresh edits", to: "/", tone: "dark" },
  { label: "My Cart", text: "2 items ready", to: "/cart", tone: "light" },
  { label: "Checkout", text: "Quick secure", to: "/checkout", tone: "gold" },
  { label: "Support", text: "Need help?", to: "/profile", tone: "soft" },
];

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    try {
      const currentUser = localStorage.getItem("rewear-current-user");
      return currentUser ? JSON.parse(currentUser) : {
        name: "ReWear Admin",
        email: "admin@rewear.com",
      };
    } catch {
      localStorage.removeItem("rewear-current-user");
      return {
        name: "ReWear Admin",
        email: "admin@rewear.com",
      };
    }
  });

  useEffect(() => {
    try {
      const currentUser = localStorage.getItem("rewear-current-user");
      const parsedUser = currentUser ? JSON.parse(currentUser) : {
        name: "ReWear Admin",
        email: "admin@rewear.com",
      };
      setUser(parsedUser);
    } catch {
      localStorage.removeItem("rewear-current-user");
      setUser({
        name: "ReWear Admin",
        email: "admin@rewear.com",
      });
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("rewear-current-user");
    setUser({
      name: "ReWear Admin",
      email: "admin@rewear.com",
    });
    navigate("/login", { replace: true });
  };

  return (
    <div className="profile-page">
      <div className="profile-promo-bar">
        <p>Welcome back • Your account dashboard</p>
      </div>

      <header className="profile-header">
        <Link to="/" className="profile-brand-block">
          <img src={rewearIcon} alt="ReWear logo" className="profile-brand-icon" />
          <span className="profile-brand-name">ReWear</span>
        </Link>

        <nav className="profile-nav">
          <Link to="/" className="profile-nav-link">Home</Link>
          <Link to="/cart" className="profile-nav-link">Cart</Link>
          <Link to="/checkout" className="profile-nav-link">Checkout</Link>
        </nav>
      </header>

      <main className="profile-main">
        <section className="profile-hero-card">
          <div className="profile-hero-copy">
            <span className="profile-label">Account</span>
            <h1>Hello, {user.name || "Customer"}.</h1>
            <p>Curated for your everyday style, favorite looks, and seamless shopping.</p>
            <div className="hero-actions">
              <Link to="/" className="primary-btn">Shop now</Link>
              <button type="button" className="secondary-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>

          <div className="profile-hero-card-right">
            <div className="profile-avatar-large">{user.name?.charAt(0)?.toUpperCase() || "U"}</div>
            <div className="profile-mini-box">
              <span>Member</span>
              <strong>Gold</strong>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.highlight}</small>
            </div>
          ))}
        </section>

        <section className="profile-grid">
          <div className="profile-card info-card">
            <div className="card-header-row">
              <div>
                <span className="profile-label">Overview</span>
                <h2>Member details</h2>
              </div>
            </div>

            <div className="detail-list">
              <div>
                <span>Full name</span>
                <strong>{user.name}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>
              <div>
                <span>Membership</span>
                <strong>Active</strong>
              </div>
              <div>
                <span>Style mood</span>
                <strong>Modern minimal</strong>
              </div>
            </div>
          </div>

          <div className="profile-card wishlist-card">
            <div className="card-header-row">
              <div>
                <span className="profile-label">Saved</span>
                <h2>Wishlist</h2>
              </div>
              <Link to="/" className="text-link">View all</Link>
            </div>

            <div className="wishlist-list">
              {savedItems.map((item) => (
                <div key={item.name} className="wishlist-item">
                  <div className={`wishlist-thumb ${item.tone}`}>
                    <span>{item.name.charAt(0)}</span>
                  </div>

                  <div className="wishlist-meta">
                    <span className="wishlist-tag">{item.tag}</span>
                    <strong>{item.name}</strong>
                    <div className="wishlist-bottom">
                      <span>{item.price}</span>
                      <button type="button" className="mini-btn">Add to bag</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="profile-bottom-grid">
          <div className="profile-card orders-card">
            <div className="card-header-row">
              <div>
                <span className="profile-label">Orders</span>
                <h2>Recent purchases</h2>
              </div>
              <Link to="/cart" className="text-link">View cart</Link>
            </div>

            <div className="orders-list">
              {recentOrders.map((order) => (
                <div key={order.id} className="order-row">
                  <div>
                    <strong>{order.item}</strong>
                    <span>{order.id}</span>
                  </div>
                  <div>
                    <span className={`status-pill ${order.status.toLowerCase().replace(/\s+/g, "-")}`}>{order.status}</span>
                    <small>{order.date}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-card action-card">
            <div className="card-header-row">
              <div>
                <span className="profile-label">Quick actions</span>
                <h2>Continue shopping</h2>
              </div>
            </div>

            <div className="action-grid">
              {quickLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`quick-action ${item.tone}`}
                >
                  <span>{item.label}</span>
                  <small>{item.text}</small>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
