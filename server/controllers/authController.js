const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res, next) => {
  try {
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
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please log in instead.",
      });
    }

    const newUser = await User.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      password: String(password),
      category: String(category),
      role: "user",
      agreeTerms: Boolean(agreeTerms),
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: {
        id: newUser._id.toString(),
        fullName: newUser.fullName,
        email: newUser.email,
        category: newUser.category,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({
      email: normalizedEmail,
      password: String(password),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please check your credentials.",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: user.role === "admin" ? "Admin login successful." : "Login successful.",
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        category: user.category,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  return res.json({
    success: true,
    user,
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, category } = req.body || {};
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (fullName) user.fullName = String(fullName).trim();
    if (phone) user.phone = String(phone).trim();
    if (category) user.category = String(category);

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        category: user.category,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.password !== currentPassword) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters long." });
    }

    user.password = String(newPassword);
    await user.save();

    return res.json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res) => {
  return res.json({ success: true, message: "Logged out successfully." });
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  logoutUser,
};
