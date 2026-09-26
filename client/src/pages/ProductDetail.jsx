import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_URL = "http://localhost:5000/api";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/products/${id}`);
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Product not found.");
        setProduct(result.product);
      } catch (loadError) {
        setError(loadError.message || "Unable to load product details.");
      }
    };

    fetchProduct();
  }, [id]);

  if (error) {
    return (
      <div style={{ padding: "32px", textAlign: "center" }}>
        <h2>Product unavailable</h2>
        <p>{error}</p>
        <Link to="/">Go back home</Link>
      </div>
    );
  }

  if (!product) {
    return <div style={{ padding: "32px", textAlign: "center" }}>Loading product...</div>;
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#1d1d1d", fontWeight: 700 }}>← Back to catalog</Link>
        <button type="button" onClick={() => navigate("/cart")} style={{ padding: "10px 16px", borderRadius: "10px", border: "none", background: "#1a1a1a", color: "white", cursor: "pointer" }}>Cart</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", alignItems: "center" }}>
        <img src={product.image} alt={product.name} style={{ width: "100%", borderRadius: "20px", objectFit: "cover", maxHeight: "620px" }} />
        <div>
          <span style={{ display: "inline-block", background: "#f1e2c9", color: "#4d3c1a", borderRadius: "999px", padding: "6px 12px", fontWeight: 700 }}>{product.category}</span>
          <h1 style={{ margin: "16px 0 10px", fontSize: "2.5rem" }}>{product.name}</h1>
          <p style={{ color: "#666", fontSize: "1.05rem" }}>{product.description || "Premium ReWear product with modern styling."}</p>
          <div style={{ margin: "20px 0", fontSize: "1.8rem", fontWeight: 800 }}>₹{product.price}</div>
          <div style={{ color: "#4b7a3d", fontWeight: 700, marginBottom: "20px" }}>Available stock: {product.stock}</div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button type="button" onClick={() => addToCart({ ...product, id: product._id || product.id })} style={{ flex: 1, padding: "14px 18px", border: "none", borderRadius: "12px", background: "#1a1a1a", color: "white", cursor: "pointer", fontWeight: 700 }}>Add to cart</button>
            <button type="button" onClick={() => navigate("/checkout")} style={{ flex: 1, padding: "14px 18px", border: "1px solid #ccc", borderRadius: "12px", background: "#fff", cursor: "pointer", fontWeight: 700 }}>Buy now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
