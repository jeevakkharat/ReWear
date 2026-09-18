import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import Register from "./Register";
import "../components/Login.css";
import rewearLogo from "../assets/rewear-icon.svg";

const API_URL = "http://localhost:5000/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Login failed. Please try again.");
        return;
      }

      localStorage.setItem(
        "rewear-current-user",
        JSON.stringify({
          name: result.user.fullName,
          email: result.user.email,
        })
      );

      const redirectPath = location.state?.from?.pathname || "/";

      navigate(redirectPath, {
        replace: true,
        state: {
          loginSuccess: true,
          name: result.user.fullName.split(" ")[0],
        },
      });
    } catch (networkError) {
      setError("Unable to connect to the server. Please try again later.");
      console.error(networkError);
    }
  };

  return (
    <div className="login-page">
      <nav className="login-nav">
        <div className="nav-brand">
          <img src={rewearLogo} alt="ReWear Logo" className="nav-logo" />
          <span className="nav-brand-text">ReWear</span>
        </div>

        <div className="tag-line">
          <span>Trendy Fashion for Men, Women & Kids</span>
        </div>

        <button
          type="button"
          className="nav-register"
          onClick={() => setIsRegistering(true)}
        >
          Register
        </button>
      </nav>

      <div className="login-content">
        <div className="left-side">
          <div className="overlay">
            <h1>ReWear</h1>

            <h2>Wear Confidence.</h2>

            <p>
              Discover trendy and affordable fashion for Men, Women and Kids.
            </p>
          </div>
        </div>

        <div className="right-side">
          {isRegistering ? (
            <Register onBackToLogin={() => setIsRegistering(false)} />
          ) : (
            <div className="login-card">
              <h2>Welcome Back 👋</h2>

              <p>Login to continue shopping.</p>

              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                />

                <div className="password-box">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />

                  <span onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                <div className="options">
                  <label>
                    <input type="checkbox" />
                    Remember me
                  </label>

                  <a href="#">Forgot Password?</a>
                </div>

                {error && <p className="form-error">{error}</p>}

                <button className="login-btn" type="submit">
                  Login
                </button>
              </form>

              <button className="google-btn" type="button">
                <FaGoogle />
                Continue with Google
              </button>

              <p className="register">
                Don't have an account?
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setIsRegistering(true)}
                >
                  Register
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}