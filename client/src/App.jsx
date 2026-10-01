import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import Profile from "./pages/Profile";
import ProductDetailPage from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import AdminDashboard from "./pages/AdminDashboard";
import { CartProvider } from "./context/CartContext";
import "./App.css";

function getCurrentUser() {
  try {
    const storedUser = localStorage.getItem("rewear-current-user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("rewear-current-user");
    return null;
  }
}

function ProtectedAdminRoute({ children }) {
  const currentUser = getCurrentUser();

  if (!currentUser?.token || currentUser.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function ProtectedUserRoute({ children }) {
  const currentUser = getCurrentUser();

  if (!currentUser?.token || !currentUser.role || currentUser.role === "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={(
              <ProtectedUserRoute>
                <CheckoutPage />
              </ProtectedUserRoute>
            )}
          />
          <Route
            path="/profile"
            element={
              <ProtectedUserRoute>
                <Profile />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/register"
            element={
              <Register onBackToLogin={() => (window.location.href = "/login")} />
            }
          />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
