import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import Profile from "./pages/Profile";
import { CartProvider } from "./context/CartContext";
import "./App.css";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<Profile />} />
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
