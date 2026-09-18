import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import rewearIcon from "../assets/rewear-icon.svg";
import "../components/Cart.css";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, subtotal, shipping, total } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 3 })}`;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setAppliedCoupon(couponCode.trim());
    setCouponCode("");
  };

  return (
    <div className="cart-page">
      <div className="cart-promo-bar">
        <p>Free shipping on orders over Rs.3000 • Fast delivery across India</p>
      </div>

      <header className="cart-header">
        <Link to="/" className="cart-brand-block">
          <img src={rewearIcon} alt="ReWear logo" className="cart-brand-icon" />
          <span className="cart-brand-name">ReWear</span>
        </Link>
      </header>

      <main className="cart-main">
        <section className="cart-grid">
          <div className="cart-items-panel">
            <div className="cart-section-head">
              <div>
                <span className="section-tag dark">Your bag</span>
                <h1>Shopping cart</h1>
              </div>
              <Link to="/" className="continue-shopping">Continue shopping</Link>
            </div>

            {items.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛍️</div>
                <h2>Your cart is empty</h2>
                <p>Add a few statement pieces and come back here to complete your order.</p>
                <Link to="/" className="primary-btn cart-empty-btn">Shop now</Link>
              </div>
            ) : (
              <div className="cart-list">
                {items.map((item) => (
                  <article key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-image" />

                    <div className="cart-item-info">
                      <div className="cart-item-topline">
                        <span className="cart-item-category">{item.category || "Featured"}</span>
                        <button
                          type="button"
                          className="remove-item"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>

                      <h3>{item.name}</h3>
                      <p>Premium everyday essential • Size M</p>

                      <div className="cart-item-actions">
                        <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                          <button type="button" onClick={() => updateQuantity(item.id, -1)}>
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, 1)}>
                            +
                          </button>
                        </div>

                        <strong>{formatCurrency(item.price * item.quantity)}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="cart-summary">
            <h2>Order summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <strong>{shipping === 0 ? "Free" : formatCurrency(shipping)}</strong>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <strong>{formatCurrency(0)}</strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-row total-row">
              <span>Total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>

            <div className="coupon-box">
              <label htmlFor="couponCode" className="coupon-label">Coupon code</label>
              <div className="coupon-row">
                <input
                  id="couponCode"
                  type="text"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Enter code"
                />
                <button type="button" className="secondary-btn" onClick={handleApplyCoupon}>
                  Apply
                </button>
              </div>
              {appliedCoupon && <p className="coupon-applied">Applied: {appliedCoupon}</p>}
            </div>

            <button
              type="button"
              className="primary-btn full-width"
              onClick={() => items.length > 0 && navigate("/checkout")}
              disabled={items.length === 0}
            >
              Checkout
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}
