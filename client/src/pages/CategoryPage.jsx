import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_URL = "http://localhost:5000/api";

export default function CategoryPage() {
  const { category } = useParams();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products/category/${encodeURIComponent(category || "")}`);
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || "Failed to load products.");
        setProducts(result.products || []);
      } catch (loadError) {
        setError(loadError.message || "Unable to load category products.");
      }
    };

    fetchProducts();
  }, [category]);

  const title = useMemo(() => (category ? category[0].toUpperCase() + category.slice(1) : "Products"), [category]);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <Link to="/" style={{ color: "#1d1d1d", textDecoration: "none", fontWeight: 700 }}>← ReWear</Link>
          <h1 style={{ margin: "8px 0 0" }}>{title}</h1>
        </div>
        <Link to="/cart" style={{ textDecoration: "none", background: "#1a1a1a", color: "white", padding: "10px 16px", borderRadius: "10px" }}>Cart</Link>
      </div>

      {error ? <p>{error}</p> : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
        {products.map((product) => (
          <div key={product._id || product.id} style={{ background: "#fff", borderRadius: "18px", padding: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
            <img src={product.image} alt={product.name} style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "12px", marginBottom: "12px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
              <span style={{ color: "#777", fontSize: "0.85rem" }}>{product.category}</span>
              <span style={{ color: "#a76f00", fontWeight: 700 }}>★ {product.rating || 4.8}</span>
            </div>
            <h3 style={{ margin: "10px 0 6px" }}>{product.name}</h3>
            <div style={{ fontWeight: 800, marginBottom: "12px" }}>₹{product.price}</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <Link to={`/products/${product._id || product.id}`} style={{ flex: 1, textAlign: "center", textDecoration: "none", background: "#f1e2c9", color: "#4d3c1a", padding: "10px 12px", borderRadius: "10px", fontWeight: 700 }}>View</Link>
              <button type="button" onClick={() => addToCart({ ...product, id: product._id || product.id })} style={{ flex: 1, border: "none", background: "#1a1a1a", color: "white", padding: "10px 12px", borderRadius: "10px", cursor: "pointer", fontWeight: 700 }}>Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
