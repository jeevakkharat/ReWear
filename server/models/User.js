const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  password: String,
  category: String,
  role: { type: String, enum: ["admin", "user"], default: "user" },
  agreeTerms: Boolean,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
