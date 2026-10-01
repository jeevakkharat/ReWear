import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import rewearIcon from "../assets/rewear-icon.svg";
import "../components/Checkout.css";

const initialCheckoutForm = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pinCode: "",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, shipping, total, placeOrder } = useCart();
  const [formData, setFormData] = useState(initialCheckoutForm);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (items.length === 0 || isSubmitting) return;

    setSubmitError("");
    setIsSubmitting(true);
    try {
      const order = await placeOrder({
        ...formData,
        paymentMethod,
      });

      setOrderId(order.id);
      setOrderPlaced(true);
      setFormData(initialCheckoutForm);
      setPaymentMethod("UPI");
    } catch (error) {
      setSubmitError(error.message || "Unable to place your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="checkout-page">
        <header className="checkout-header">
          <Link to="/" className="checkout-brand"><img src={rewearIcon} alt="ReWear logo" /><span>ReWear</span></Link>
        </header>

        <main className="checkout-empty-state">
          <h1>Your cart is empty</h1>
          <p>Add some items before checking out.</p>
          <Link to="/" className="primary-btn">Continue shopping</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <Link to="/" className="checkout-brand">
          <img src={rewearIcon} alt="ReWear logo" />
          <span>ReWear</span>
        </Link>
      </header>

      <main className="checkout-main">
        {orderPlaced ? (
          <section className="order-success-card">
            <span className="section-tag dark">Order confirmed</span>
            <h1>Thank you for your purchase!</h1>
            <p>
              Your order <strong>{orderId}</strong> has been placed successfully and is now being prepared.
            </p>
            <div className="success-meta">
              <span>Estimated delivery: 3–5 business days</span>
              <span>Status: Pending</span>
            </div>
            <Link to="/" className="primary-btn cart-empty-btn">Continue shopping</Link>
          </section>
        ) : (
          <section className="checkout-layout">
            <div className="checkout-form-panel">
              <div className="checkout-header-row">
                <div>
                  <span className="section-tag dark">Checkout</span>
                  <h1>Shipping details</h1>
                </div>
                <button type="button" className="text-link-button" onClick={() => navigate("/cart")}>
                  Back to cart
                </button>
              </div>

              <form className="checkout-form" onSubmit={handleSubmit}>
                <div className="field-grid two-col">
                  <label>
                    <span>Full name</span>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    <span>Phone number</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>

                <label>
                  <span>Address line 1</span>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>Address line 2</span>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Apartment, suite, landmark"
                  />
                </label>

                <div className="field-grid three-col">
                  <label>
                    <span>City</span>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    <span>State</span>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    <span>Pin code</span>
                    <input
                      type="text"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </div>

                <div className="payment-block">
                  <h3>Payment method</h3>
                  <div className="payment-options">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="UPI"
                        checked={paymentMethod === "UPI"}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                      />
                      <span>UPI</span>
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Card"
                        checked={paymentMethod === "Card"}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                      />
                      <span>Card</span>
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Cash on Delivery"
                        checked={paymentMethod === "Cash on Delivery"}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                      />
                      <span>Cash on delivery</span>
                    </label>
                  </div>
                </div>

                {submitError && <p className="form-error">{submitError}</p>}
                <button type="submit" className="primary-btn full-width" disabled={isSubmitting}>
                  {isSubmitting ? "Saving order..." : "Place order"}
                </button>
              </form>
            </div>

            <aside className="checkout-review-panel">
              <div className="review-card">
                <h2>Review order</h2>

                <div className="review-items">
                  {items.map((item) => (
                    <div key={item.id} className="review-item">
                      <div>
                        <strong>{item.name}</strong>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

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

                <div className="delivery-note-box">
                  <h3>Delivery note</h3>
                  <p>We’ll keep you updated on your order status and shipment updates via SMS or email.</p>
                </div>

                <div className="estimated-delivery">Estimated delivery: 3–5 business days</div>
              </div>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}
