import { useEffect, useState } from "react";
import { FiLayers, FiLogOut, FiPackage, FiRotateCcw, FiShoppingBag, FiUsers } from "react-icons/fi";
import "./AdminDashboard.css";

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
    window.dispatchEvent(new Event("rewear-auth-changed"));
    window.location.href = "/login";
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__container">
        <header className="admin-dashboard__header">
          <div className="admin-dashboard__title">
            <p className="admin-dashboard__eyebrow">Admin Panel</p>
            <h1>ReWear Dashboard</h1>
          </div>
          <button type="button" onClick={handleLogout} className="admin-button admin-button--secondary admin-dashboard__logout">
            <FiLogOut aria-hidden="true" />
            Logout
          </button>
        </header>

        {message && <div className="admin-notice admin-notice--success" role="status">{message}</div>}
        {error && <div className="admin-notice admin-notice--error" role="alert">{error}</div>}

        <section className="admin-stats" aria-label="Dashboard summary">
          <StatCard icon={FiPackage} label="Total Products" value={dashboard.stats.totalProducts || 0} />
          <StatCard icon={FiLayers} label="Inventory Items" value={dashboard.stats.inventoryCount || 0} />
          <StatCard icon={FiRotateCcw} label="Pending Returns" value={dashboard.stats.pendingReturns || 0} />
          <StatCard icon={FiShoppingBag} label="Total Orders" value={orders.length} />
          <StatCard icon={FiUsers} label="Customers" value={users.length} />
        </section>

        <section className="admin-grid admin-grid--primary">
          <div className="admin-card">
            <div className="admin-card__header">
              <div>
                <p className="admin-card__eyebrow">Catalog</p>
                <h2>{editingProductId ? "Edit Product" : "Add New Product"}</h2>
              </div>
            </div>
            <form onSubmit={handleAddOrUpdateProduct} className="admin-form">
              <input name="name" value={productForm.name} onChange={handleProductInputChange} placeholder="Product name" style={inputStyle} />
              <select name="category" value={productForm.category} onChange={handleProductInputChange} style={inputStyle}>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
              <div className="admin-form__row">
                <input name="price" type="number" value={productForm.price} onChange={handleProductInputChange} placeholder="Price" style={inputStyle} />
                <input name="stock" type="number" value={productForm.stock} onChange={handleProductInputChange} placeholder="Stock" style={inputStyle} />
              </div>
              <input name="image" value={productForm.image} onChange={handleProductInputChange} placeholder="Image URL" style={inputStyle} />
              <textarea name="description" value={productForm.description} onChange={handleProductInputChange} placeholder="Description" rows={4} className="admin-input admin-input--textarea" />
              <select name="status" value={productForm.status} onChange={handleProductInputChange} style={inputStyle}>
                <option value="active">Active</option>
                <option value="featured">Featured</option>
                <option value="archived">Archived</option>
              </select>
              <div className="admin-form__actions">
                <button type="submit" className="admin-button admin-button--primary">
                  {editingProductId ? "Update Product" : "Add Product"}
                </button>
                {editingProductId && (
                  <button type="button" onClick={() => { setEditingProductId(null); setProductForm(emptyProductForm); }} className="admin-button admin-button--secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-card">
            <div className="admin-card__header">
              <div>
                <p className="admin-card__eyebrow">Stock overview</p>
                <h2>Inventory</h2>
              </div>
            </div>
            <div className="admin-list">
              {inventory.length === 0 ? (
                <p className="admin-empty">No inventory items found.</p>
              ) : (
                inventory.map((product) => (
                  <div key={product._id || product.id} className="admin-list-item">
                    <div className="admin-list-item__content">
                      <strong className="admin-list-item__title">{product.name}</strong>
                      <div className="admin-list-item__meta">{product.category} <span>•</span> ₹{product.price} <span>•</span> Stock: {product.stock}</div>
                    </div>
                    <div className="admin-list-item__actions">
                      <button type="button" onClick={() => handleEditProduct(product)} className="admin-button admin-button--small admin-button--secondary">Edit</button>
                      <button type="button" onClick={() => handleDeleteProduct(product._id || product.id)} className="admin-button admin-button--small admin-button--danger">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="admin-grid admin-grid--secondary">
          <div className="admin-card">
            <div className="admin-card__header">
              <div>
                <p className="admin-card__eyebrow">Catalog setup</p>
                <h2>Category Management</h2>
              </div>
            </div>
            <form onSubmit={handleAddCategory} className="admin-form admin-form--spaced">
              <input name="name" value={categoryForm.name} onChange={handleCategoryInputChange} placeholder="Category name" style={inputStyle} />
              <input name="image" value={categoryForm.image} onChange={handleCategoryInputChange} placeholder="Image URL" style={inputStyle} />
              <textarea name="description" value={categoryForm.description} onChange={handleCategoryInputChange} placeholder="Description" rows={3} className="admin-input admin-input--textarea" />
              <button type="submit" className="admin-button admin-button--primary">
                Add Category
              </button>
            </form>
            <div className="admin-list">
              {categories.length === 0 ? <p className="admin-empty">No categories yet.</p> : categories.map((category) => (
                <div key={category._id || category.id} className="admin-list-item">
                  <div className="admin-list-item__content">
                    <strong className="admin-list-item__title">{category.name}</strong>
                    <div className="admin-list-item__meta">{category.description || "Custom category"}</div>
                  </div>
                  <button type="button" onClick={() => handleDeleteCategory(category._id || category.id)} className="admin-button admin-button--small admin-button--danger">Delete</button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card__header">
              <div>
                <p className="admin-card__eyebrow">People</p>
                <h2>Customer Accounts</h2>
              </div>
            </div>
            <div className="admin-list">
              {users.length === 0 ? <p className="admin-empty">No customer accounts found.</p> : users.map((user) => (
                <div key={user._id || user.id} className="admin-list-item">
                  <div className="admin-list-item__content">
                    <strong className="admin-list-item__title">{user.fullName}</strong>
                    <div className="admin-list-item__meta">{user.email}</div>
                    <div className="admin-list-item__role">Role: {user.role}</div>
                  </div>
                  {user.role !== "admin" && (
                    <button type="button" onClick={() => handleDeleteUser(user._id || user.id)} className="admin-button admin-button--small admin-button--danger">Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-card admin-card--spaced">
          <div className="admin-card__header">
            <div>
              <p className="admin-card__eyebrow">Fulfillment</p>
              <h2>Order Management</h2>
            </div>
          </div>
          <div className="admin-list">
            {orders.length === 0 ? (
              <p className="admin-empty">No orders found.</p>
            ) : (
              orders.map((order) => (
                <div key={order._id || order.id} className="admin-order">
                  <div className="admin-order__customer">
                    <strong className="admin-list-item__title">{order.customer?.fullName || "Customer"}</strong>
                    <div className="admin-list-item__meta">{order.customer?.email || "No email"}</div>
                    <div className="admin-list-item__meta">Items: {order.items?.length || 0} <span>•</span> Total: ₹{order.total || 0}</div>
                  </div>
                  <select value={order.status || "Pending"} onChange={(event) => handleOrderStatusChange(order._id || order.id, event.target.value)} style={inputStyle}>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <span className={`admin-status ${order.status === "Delivered" ? "admin-status--success" : ""}`}>{order.status || "Pending"}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="admin-card admin-card--spaced">
          <div className="admin-card__header">
            <div>
              <p className="admin-card__eyebrow">Aftercare</p>
              <h2>Return Requests</h2>
            </div>
          </div>
          <div className="admin-list">
            {returns.length === 0 ? (
              <p className="admin-empty">No return requests.</p>
            ) : (
              returns.map((item) => (
                <div key={item._id || item.id} className="admin-list-item">
                  <div className="admin-list-item__content">
                    <strong className="admin-list-item__title">{item.orderId}</strong>
                    <div className="admin-list-item__meta">{item.customerEmail}</div>
                    <div className="admin-list-item__meta">{item.reason}</div>
                    <div className={`admin-status ${item.status === "approved" ? "admin-status--success" : ""}`}>Status: {item.status}</div>
                  </div>
                  {item.status !== "approved" && (
                    <button type="button" onClick={() => handleApproveReturn(item._id || item.id)} className="admin-button admin-button--small admin-button--approve">
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

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="admin-stat">
      <div className="admin-stat__icon"><Icon aria-hidden="true" /></div>
      <div className="admin-stat__label">{label}</div>
      <strong className="admin-stat__value">{value}</strong>
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
  background: "white",
};
