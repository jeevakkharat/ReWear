const express = require("express");

const app = express();
const users = [];

const adminUser = {
  id: "admin-1",
  fullName: "ReWear Admin",
  email: "admin@rewear.com",
  phone: "9999999999",
  password: "admin123",
  category: "admin",
  agreeTerms: true,
  createdAt: new Date().toISOString(),
};

users.push(adminUser);

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "ReWear server is running" });
});

app.post("/api/auth/register", (req, res) => {
  const { fullName, email, phone, password, confirmPassword, category, agreeTerms } = req.body || {};

  if (!fullName || !email || !phone || !password || !confirmPassword || !category || !agreeTerms) {
    return res.status(400).json({
      success: false,
      message: "Please complete all required fields and agree to the terms.",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match.",
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = users.find((user) => user.email === normalizedEmail);

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists. Please log in instead.",
    });
  }

  const newUser = {
    id: Date.now().toString(),
    fullName: String(fullName).trim(),
    email: normalizedEmail,
    phone: String(phone).trim(),
    password: String(password),
    category: String(category),
    agreeTerms: Boolean(agreeTerms),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  return res.status(201).json({
    success: true,
    message: "Registration successful.",
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      category: newUser.category,
    },
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter both email and password.",
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = users.find(
    (item) => item.email === normalizedEmail && item.password === String(password)
  ) || (
    normalizedEmail === "admin@rewear.com" && String(password) === "admin123"
      ? adminUser
      : null
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password. Please check your credentials.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      category: user.category,
    },
  });
});

module.exports = app;
