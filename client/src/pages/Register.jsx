import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaGoogle } from "react-icons/fa";
import "../components/Register.css";

const API_URL = "http://localhost:5000/api";

const initialFormData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  category: "",
  agreeTerms: false,
};

export default function Register({ onBackToLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const { fullName, email, phone, password, confirmPassword, category, agreeTerms } = formData;

    if (!fullName || !email || !phone || !password || !confirmPassword || !category || !agreeTerms) {
      setError("Please complete all required fields and agree to the terms.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          confirmPassword,
          category,
          agreeTerms,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Registration failed. Please try again.");
        return;
      }

      localStorage.setItem(
        "rewear-registration-success",
        JSON.stringify({
          name: fullName.split(" ")[0],
        })
      );

      localStorage.setItem(
        "rewear-current-user",
        JSON.stringify({
          name: fullName,
          email,
          role: "user",
          token: result.token || "",
        })
      );

      const redirectPath = location.state?.from?.pathname || "/";

      navigate(redirectPath, {
        replace: true,
        state: {
          registrationSuccess: true,
          name: fullName.split(" ")[0],
        },
      });
    } catch (networkError) {
      setError("Unable to connect to the server. Please try again later.");
      console.error(networkError);
    }
  };

  const handleBack = onBackToLogin || (() => navigate("/login"));

  return (
    <div className="register-card">
      <button type="button" className="back-link" onClick={handleBack}>
        <FaArrowLeft />
        Back to Login
      </button>

      <h2>Create Account</h2>

      <p>Sign up to start shopping with ReWear.</p>

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="" disabled>
              Select category
            </option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </select>
        </div>

        <label className="terms">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleChange}
          />
          I agree to the Terms & Conditions
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="register-btn" type="submit">
          Create Account
        </button>
      </form>

      <button className="google-btn" type="button">
        <FaGoogle />
        Continue with Google
      </button>

      <p className="register-switch">
        Already have an account?
        <button type="button" className="text-button" onClick={handleBack}>
          Login
        </button>
      </p>
    </div>
  );
}
