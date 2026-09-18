import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import rewearIcon from "../assets/rewear-icon.svg";
import { useCart } from "../context/CartContext";
import "../components/Home.css";

const categories = [
  {
    name: "Men",
    label: "Sharp essentials",
    image:
      "https://i.pinimg.com/736x/4f/31/29/4f31293845947dc98f6de9c5313f3c5c.jpg",
    route: "/",
  },
  {
    name: "Women",
    label: "Modern silhouettes",
    image:
      "https://i.pinimg.com/736x/83/81/1e/83811e51b571d9834f1fe48bf1944f71.jpg",
    route: "/",
  },
  {
    name: "Kids",
    label: "Playful picks",
    image:
      "https://i.pinimg.com/1200x/8e/e3/5b/8ee35b2a1c6d87f521423a0739ce0643.jpg",
    route: "/",
  },
];

const products = [
  {
    id: 1,
    name: "Urban Layer Jacket",
    category: "Men",
    price: 1999,
    originalPrice: 2599,
    rating: 4.8,
    reviews: 120,
    tag: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1550967155-97a1ebf16bd2?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    name: "Blue Blossom",
    category: "Women",
    price: 1740,
    originalPrice: 2350,
    rating: 4.9,
    reviews: 98,
    tag: "New Drop",
    image:
      "https://images.unsplash.com/photo-1763294632421-84383bbb9dda?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    name: "Mini Hoodie",
    category: "Kids",
    price: 1460,
    originalPrice: 1899,
    rating: 4.7,
    reviews: 64,
    tag: "Top Rated",
    image:
      "https://plus.unsplash.com/premium_photo-1706151506322-f5d534b59263?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjV8fGtpZCUyMGluJTIwaG9vZGllfGVufDB8fDB8fHww",
  },
  {
    id: 4,
    name: "Street Tee",
    category: "Men",
    price: 1320,
    originalPrice: 1799,
    rating: 4.6,
    reviews: 88,
    tag: "Limited",
    image:
      "https://plus.unsplash.com/premium_photo-1727942416727-9f16462ef11b?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 5,
    name: "Velvet Bloom Dress",
    category: "Women",
    price: 1830,
    originalPrice: 2599,
    rating: 4.9,
    reviews: 142,
    tag: "Trending",
    image:
      "https://images.unsplash.com/photo-1775510139259-9a29f5c67e65?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 6,
    name: "Sunny Sprout Set",
    category: "Kids",
    price: 1399,
    originalPrice: 1785,
    rating: 4.8,
    reviews: 72,
    tag: "Fresh",
    image:
      "https://images.unsplash.com/photo-1599624427857-461fd60c23e5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const featuredCollections = [
  {
    title: "Weekend Edit",
    subtitle: "Fresh fits for easygoing days",
    image:
      "https://i.pinimg.com/736x/58/6f/f3/586ff3db9789d0599e5be3050f6bf75e.jpg",
  },
  {
    title: "Work to Weekend",
    subtitle: "Smart layers with polished details",
    image:
      "https://i.pinimg.com/736x/14/da/3b/14da3b0277e23929001c69ea54837de3.jpg",
  },
  {
    title: "Kids Adventure",
    subtitle: "Comfort-driven styles for all-day fun",
    image:
      "https://i.pinimg.com/1200x/6b/f9/da/6bf9da086b6d6e17b3ad8d925accd4d7.jpg",
  },
];

const dealCards = [
  {
    title: "Spring Fashion Sale",
    description: "Up to 40% off on curated essentials.",
    badge: "Today only",
  },
  {
    title: "New Season Accessories",
    description: "Bags, shoes, and finishing touches.",
    badge: "Trending",
  },
  {
    title: "Members Reward",
    description: "Earn points on every purchase.",
    badge: "VIP",
  },
];

const testimonials = [
  {
    name: "Maya R.",
    text: "ReWear makes shopping effortless. The fit is spot on and every order arrives beautifully packaged.",
  },
  {
    name: "Daniel T.",
    text: "The style curation feels premium and the delivery speed is excellent. It feels like a luxury store, but accessible.",
  },
  {
    name: "Aisha K.",
    text: "I love the Kids section. The pieces are durable, stylish, and perfect for everyday wear.",
  },
  {
    name: "James D.",
    text: "ReWear has a sharp, modern aesthetic and the quality feels premium without being overpriced. Every piece I’ve bought looks polished, fits well, and has become a staple in my wardrobe."
  },
];

const navItems = ["New Arrivals", "Best Sellers", "Sale", "Brands"];

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function Home() {
  const location = useLocation();
  const { addToCart, itemCount } = useCart();
  const [activeCategory, setActiveCategory] = useState("all");
  const [registrationMessage, setRegistrationMessage] = useState("");

  useEffect(() => {
    const storedSuccess = localStorage.getItem("rewear-registration-success");

    if (location.state?.registrationSuccess) {
      setRegistrationMessage(
        `Welcome ${location.state.name || "there"}! Your account has been created successfully.`
      );
      localStorage.removeItem("rewear-registration-success");
      return;
    }

    if (storedSuccess) {
      const parsedSuccess = JSON.parse(storedSuccess);
      setRegistrationMessage(
        `Welcome ${parsedSuccess.name || "there"}! Your account has been created successfully.`
      );
      localStorage.removeItem("rewear-registration-success");
    }
  }, [location.state]);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <div className="home-page">
      <div className="promo-bar">
        <p>Free shipping on orders over Rs. 3000 • New season arrivals now live</p>
      </div>

      {registrationMessage && (
        <div className="registration-banner">
          <span>{registrationMessage}</span>
        </div>
      )}

      <header className="home-header">
        <div className="brand-block">
          <img src={rewearIcon} alt="ReWear logo" className="brand-icon" />
          <span className="brand-name">ReWear</span>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button key={item} type="button" className="nav-item">
              {item}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <Link to="/profile" className="ghost-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            Profile
          </Link>
          <Link to="/cart" className="primary-btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            Cart {itemCount > 0 ? `(${itemCount})` : ""}
          </Link>
        </div>
      </header>

      <main className="home-main">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">New collection of Sep 2026</span>
            <h1>Wear confidence in every moment.</h1>
            <p>
              Discover trending looks for Men, Women, and Kids with premium comfort,
              effortless style, and everyday value.
            </p>

            <div className="hero-actions">
              <button type="button" className="primary-btn large">
                Shop now
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <strong>50K+</strong>
                <span>happy shoppers</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>average rating</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>support team</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card main-card">
              <img
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
                alt="Fashion collection"
              />
              <div className="floating-badge top">Trending now</div>
              <div className="floating-badge bottom">
                <span>From</span>
                <strong>Rs.1500</strong>
              </div>
            </div>

            <div className="mini-panel">
              <span>Best sellers</span>
              <h3>Curated styles for every day</h3>
            </div>
          </div>
        </section>

        <section className="category-section">
          <div className="section-heading">
            <div>
              <span className="section-tag">Shop by category</span>
              <h2>Find your perfect style</h2>
            </div>
            <button type="button" className="text-link">
              Explore all
            </button>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <article key={category.name} className="category-card">
                <img src={category.image} alt={category.name} />
                <Link to={category.route} className="category-content">
                  <span>{category.label}</span>
                  <h3>{category.name}</h3>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="collection-section">
          <div className="section-heading">
            <div>
              <span className="section-tag">Featured</span>
              <h2>Handpicked collections</h2>
            </div>
          </div>

          <div className="collection-grid">
            {featuredCollections.map((collection) => (
              <article key={collection.title} className="collection-card">
                <img src={collection.image} alt={collection.title} />
                <div className="collection-overlay">
                  <p>{collection.subtitle}</p>
                  <h3>{collection.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="product-section">
          <div className="section-heading">
            <div>
              <span className="section-tag">Trending</span>
              <h2>Popular products</h2>
            </div>

            <div className="filter-tabs" aria-label="Product filters">
              <button
                type="button"
                className={activeCategory === "all" ? "filter-btn active" : "filter-btn"}
                onClick={() => setActiveCategory("all")}
              >
                All
              </button>
              <button
                type="button"
                className={activeCategory === "Men" ? "filter-btn active" : "filter-btn"}
                onClick={() => setActiveCategory("Men")}
              >
                Men
              </button>
              <button
                type="button"
                className={activeCategory === "Women" ? "filter-btn active" : "filter-btn"}
                onClick={() => setActiveCategory("Women")}
              >
                Women
              </button>
              <button
                type="button"
                className={activeCategory === "Kids" ? "filter-btn active" : "filter-btn"}
                onClick={() => setActiveCategory("Kids")}
              >
                Kids
              </button>
            </div>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-image-wrap">
                  <img src={product.image} alt={product.name} />
                  <span className="product-tag">{product.tag}</span>
                </div>

                <div className="product-content">
                  <div className="product-meta">
                    <span>{product.category}</span>
                    <span className="rating">★ {product.rating}</span>
                  </div>
                  <h3>{product.name}</h3>

                  <div className="product-bottom">
                    <div className="price-wrap">
                      <strong>{formatCurrency(product.price)}</strong>
                      <span>{formatCurrency(product.originalPrice)}</span>
                    </div>

                    <button type="button" className="mini-btn" onClick={() => addToCart(product)}>
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="benefits-section">
          <div className="section-heading">
            <div>
              <span className="section-tag">Why choose us</span>
              <h2>Made for modern living</h2>
            </div>
          </div>

          <div className="benefit-grid">
            <div className="benefit-item">
              <span className="benefit-icon">🚚</span>
              <h3>Fast delivery</h3>
              <p>Quick shipping and easy tracking on every order.</p>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🔒</span>
              <h3>Secure checkout</h3>
              <p>Protected payments and dependable customer care.</p>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">↩️</span>
              <h3>Easy returns</h3>
              <p>Hassle-free returns within 30 days.</p>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✨</span>
              <h3>Premium quality</h3>
              <p>Thoughtfully designed essentials built to last.</p>
            </div>
          </div>
        </section>

        <section className="testimonial-section">
          <div className="section-heading">
            <div>
              <span className="section-tag">Reviews</span>
              <h2>Loved by our community</h2>
            </div>
          </div>

          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <article key={item.name} className="testimonial-card">
                <div className="stars">★★★★★</div>
                <p>“{item.text}”</p>
                <h3>{item.name}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="newsletter-section">
          <div>
            <span className="section-tag">Stay updated</span>
            <h2>Get exclusive offers and style tips</h2>
          </div>

          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit" className="primary-btn">
              Subscribe
            </button>
          </form>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-brand">
          <img src={rewearIcon} alt="ReWear logo" className="brand-icon" />
          <span>ReWear</span>
        </div>

        <div className="footer-links">
          <div>
            <h4>Shop</h4>
            <Link to="/">Home</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/profile">Profile</Link>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#">About us</a>
            <a href="#">Contact</a>
            <a href="#">Careers</a>
          </div>
          <div>
            <h4>Support</h4>
            <a href="#">Shipping</a>
            <a href="#">Returns</a>
            <a href="#">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}