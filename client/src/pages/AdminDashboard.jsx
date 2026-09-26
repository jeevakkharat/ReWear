import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

const emptyProductForm = {
  name: "",
  category: "Men",
  price: "",
  stock: "",
  description: "",
  image: "",
  status: "active",
};

const emptyCategoryForm = {
  name: "",
  description: "",
  image: "",
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState({ stats: {}, admin: {} });
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [returns, setReturns] = useState([]);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentUser = (() => {
    try {
      const stored = localStorage.getItem("rewear-current-user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const token = currentUser?.token;

  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Request failed.");
    }

    return result;
  };

  const loadAdminData = async () => {
    if (!token) return;

    try {
      const [dashboardRes, inventoryRes, categoriesRes, ordersRes, usersRes, returnsRes] = await Promise.all([
        apiRequest(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest(`${API_URL}/admin/inventory`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest(`${API_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest(`${API_URL}/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest(`${API_URL}/admin/returns`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDashboard(dashboardRes);
      setInventory(inventoryRes.inventory || []);
      setCategories(categoriesRes.categories || []);
      setOrders(ordersRes.orders || []);
      setUsers(usersRes.users || []);
      setReturns(returnsRes.returns || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load admin data.");
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [token]);

  const handleProductInputChange = (event) => {
    const { name, value } = event.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryInputChange = (event) => {
    const { name, value } = event.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateProduct = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
      };

      if (editingProductId) {
        await apiRequest(`${API_URL}/products/${editingProductId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        setMessage("Product updated successfully.");
      } else {
        await apiRequest(`${API_URL}/products`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        setMessage("Product added successfully.");
      }

      setProductForm(emptyProductForm);
      setEditingProductId(null);
      loadAdminData();
    } catch (submitError) {
      setError(submitError.message || "Unable to save product.");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product._id || product.id);
    setProductForm({
      name: product.name || "",
      category: product.category || "Men",
      price: String(product.price || ""),
      stock: String(product.stock || ""),
      description: product.description || "",
      image: product.image || "",
      status: product.status || "active",
    });
  };

  const handleDeleteProduct = async (id) => {
    try {
      await apiRequest(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Product removed successfully.");
      loadAdminData();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete product.");
    }
  };

  const handleAddCategory = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await apiRequest(`${API_URL}/categories`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(categoryForm),
      });
      setCategoryForm(emptyCategoryForm);
      setMessage("Category created successfully.");
      loadAdminData();
    } catch (categoryError) {
      setError(categoryError.message || "Unable to create category.");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await apiRequest(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Category removed successfully.");
      loadAdminData();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete category.");
    }
  };

  const handleOrderStatusChange = async (id, status) => {
    try {
      await apiRequest(`${API_URL}/orders/${id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      setMessage("Order status updated.");
      loadAdminData();
    } catch (orderError) {
      setError(orderError.message || "Unable to update order status.");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await apiRequest(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Customer account removed.");
      loadAdminData();
    } catch (userError) {
      setError(userError.message || "Unable to remove customer account.");
    }
  };

  const handleApproveReturn = async (id) => {
    try {
      await apiRequest(`${API_URL}/admin/returns/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Return request approved.");
      loadAdminData();
    } catch (approveError) {
      setError(approveError.message || "Unable to approve return.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("rewear-current-user");
    window.location.href = "/login";
  };

  return (
    <div style={{ padding: "32px", background: "#f8f6f2", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <p style={{ margin: 0, color: "#8a6d3b", fontWeight: 700 }}>Admin Panel</p>
            <h1 style={{ margin: "6px 0 0", fontSize: "2rem" }}>ReWear Dashboard</h1>
          </div>
          <button type="button" onClick={handleLogout} style={{ padding: "10px 16px", borderRadius: "10px", border: "none", background: "#1a1a1a", color: "white", cursor: "pointer" }}>
            Logout
          </button>
        </header>

        {message && <div style={{ background: "#e7f7ee", color: "#1d5b45", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px" }}>{message}</div>}
        {error && <div style={{ background: "#fdecec", color: "#9b2c2c", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px" }}>{error}</div>}

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
          <StatCard label="Total Products" value={dashboard.stats.totalProducts || 0} />
          <StatCard label="Inventory Items" value={dashboard.stats.inventoryCount || 0} />
          <StatCard label="Pending Returns" value={dashboard.stats.pendingReturns || 0} />
          <StatCard label="Total Orders" value={orders.length} />
          <StatCard label="Customers" value={users.length} />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "24px" }}>
          <div style={{ background: "white", borderRadius: "18px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 style={{ marginTop: 0 }}>{editingProductId ? "Edit Product" : "Add New Product"}</h2>
            <form onSubmit={handleAddOrUpdateProduct} style={{ display: "grid", gap: "12px" }}>
              <input name="name" value={productForm.name} onChange={handleProductInputChange} placeholder="Product name" style={inputStyle} />
              <select name="category" value={productForm.category} onChange={handleProductInputChange} style={inputStyle}>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <input name="price" type="number" value={productForm.price} onChange={handleProductInputChange} placeholder="Price" style={inputStyle} />
                <input name="stock" type="number" value={productForm.stock} onChange={handleProductInputChange} placeholder="Stock" style={inputStyle} />
              </div>
              <input name="image" value={productForm.image} onChange={handleProductInputChange} placeholder="Image URL" style={inputStyle} />
              <textarea name="description" value={productForm.description} onChange={handleProductInputChange} placeholder="Description" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
              <select name="status" value={productForm.status} onChange={handleProductInputChange} style={inputStyle}>
                <option value="active">Active</option>
                <option value="featured">Featured</option>
                <option value="archived">Archived</option>
              </select>
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="submit" style={{ flex: 1, padding: "12px 16px", border: "none", borderRadius: "10px", background: "#1f1f1f", color: "white", cursor: "pointer", fontWeight: 700 }}>
                  {editingProductId ? "Update Product" : "Add Product"}
                </button>
                {editingProductId && (
                  <button type="button" onClick={() => { setEditingProductId(null); setProductForm(emptyProductForm); }} style={{ padding: "12px 16px", border: "1px solid #ccc", borderRadius: "10px", background: "white", cursor: "pointer" }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div style={{ background: "white", borderRadius: "18px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 style={{ marginTop: 0 }}>Inventory</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {inventory.length === 0 ? (
                <p>No inventory items found.</p>
              ) : (
                inventory.map((product) => (
                  <div key={product._id || product.id} style={{ border: "1px solid #eee", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                      <div>
                        <strong>{product.name}</strong>
                        <div style={{ color: "#666", marginTop: "4px" }}>{product.category} • ₹{product.price} • Stock: {product.stock}</div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button type="button" onClick={() => handleEditProduct(product)} style={{ padding: "6px 10px", border: "none", borderRadius: "8px", background: "#f1e2c9", color: "#4d3c1a", cursor: "pointer" }}>Edit</button>
                        <button type="button" onClick={() => handleDeleteProduct(product._id || product.id)} style={{ padding: "6px 10px", border: "none", borderRadius: "8px", background: "#e8d4d4", color: "#7a2c2c", cursor: "pointer" }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
          <div style={{ background: "white", borderRadius: "18px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 style={{ marginTop: 0 }}>Category Management</h2>
            <form onSubmit={handleAddCategory} style={{ display: "grid", gap: "12px", marginBottom: "18px" }}>
              <input name="name" value={categoryForm.name} onChange={handleCategoryInputChange} placeholder="Category name" style={inputStyle} />
              <input name="image" value={categoryForm.image} onChange={handleCategoryInputChange} placeholder="Image URL" style={inputStyle} />
              <textarea name="description" value={categoryForm.description} onChange={handleCategoryInputChange} placeholder="Description" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
              <button type="submit" style={{ padding: "12px 16px", border: "none", borderRadius: "10px", background: "#2f2f2f", color: "white", cursor: "pointer", fontWeight: 700 }}>
                Add Category
              </button>
            </form>
            <div style={{ display: "grid", gap: "10px" }}>
              {categories.length === 0 ? <p>No categories yet.</p> : categories.map((category) => (
                <div key={category._id || category.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #eee", borderRadius: "10px", padding: "10px 12px" }}>
                  <div>
                    <strong>{category.name}</strong>
                    <div style={{ color: "#666", fontSize: "0.9rem" }}>{category.description || "Custom category"}</div>
                  </div>
                  <button type="button" onClick={() => handleDeleteCategory(category._id || category.id)} style={{ padding: "6px 10px", border: "none", borderRadius: "8px", background: "#e8d4d4", color: "#7a2c2c", cursor: "pointer" }}>Delete</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "white", borderRadius: "18px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 style={{ marginTop: 0 }}>Customer Accounts</h2>
            <div style={{ display: "grid", gap: "10px" }}>
              {users.length === 0 ? <p>No customer accounts found.</p> : users.map((user) => (
                <div key={user._id || user.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #eee", borderRadius: "10px", padding: "10px 12px" }}>
                  <div>
                    <strong>{user.fullName}</strong>
                    <div style={{ color: "#666", fontSize: "0.9rem" }}>{user.email}</div>
                    <div style={{ color: "#666", fontSize: "0.8rem" }}>Role: {user.role}</div>
                  </div>
                  {user.role !== "admin" && (
                    <button type="button" onClick={() => handleDeleteUser(user._id || user.id)} style={{ padding: "6px 10px", border: "none", borderRadius: "8px", background: "#e8d4d4", color: "#7a2c2c", cursor: "pointer" }}>Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: "white", borderRadius: "18px", padding: "20px", marginTop: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ marginTop: 0 }}>Order Management</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            {orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              orders.map((order) => (
                <div key={order._id || order.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr auto", gap: "10px", alignItems: "center", border: "1px solid #eee", borderRadius: "10px", padding: "12px" }}>
                  <div>
                    <strong>{order.customer?.fullName || "Customer"}</strong>
                    <div style={{ color: "#666", fontSize: "0.9rem" }}>{order.customer?.email || "No email"}</div>
                    <div style={{ color: "#666", fontSize: "0.9rem" }}>Items: {order.items?.length || 0} • Total: ₹{order.total || 0}</div>
                  </div>
                  <select value={order.status || "Pending"} onChange={(event) => handleOrderStatusChange(order._id || order.id, event.target.value)} style={inputStyle}>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <span style={{ fontSize: "0.8rem", color: order.status === "Delivered" ? "green" : "#8a6d3b", fontWeight: 700 }}>{order.status || "Pending"}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section style={{ background: "white", borderRadius: "18px", padding: "20px", marginTop: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ marginTop: 0 }}>Return Requests</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            {returns.length === 0 ? (
              <p>No return requests.</p>
            ) : (
              returns.map((item) => (
                <div key={item._id || item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #eee", borderRadius: "10px", padding: "12px" }}>
                  <div>
                    <strong>{item.orderId}</strong>
                    <div style={{ color: "#666" }}>{item.customerEmail}</div>
                    <div style={{ color: "#666" }}>{item.reason}</div>
                    <div style={{ color: item.status === "approved" ? "green" : "#a65e00", fontSize: "0.8rem" }}>Status: {item.status}</div>
                  </div>
                  {item.status !== "approved" && (
                    <button type="button" onClick={() => handleApproveReturn(item._id || item.id)} style={{ padding: "10px 12px", border: "none", borderRadius: "10px", background: "#2d7d46", color: "white", cursor: "pointer" }}>
                      Approve
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <div style={{ color: "#777" }}>{label}</div>
      <strong style={{ fontSize: "2rem" }}>{value}</strong>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  fontSize: "0.96rem",
  boxSizing: "border-box",
};
