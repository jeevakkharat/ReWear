const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  orderId: { type: String, required: true },
  paymentId: { type: String, default: "" },
  signature: { type: String, default: "" },
  gateway: { type: String, enum: ["razorpay", "stripe", "cod", "manual"], default: "manual" },
  method: { type: String, default: "COD" },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
