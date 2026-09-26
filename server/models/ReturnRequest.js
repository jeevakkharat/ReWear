const mongoose = require("mongoose");

const returnRequestSchema = new mongoose.Schema({
  orderId: String,
  customerEmail: String,
  reason: String,
  status: { type: String, default: "pending" },
  approvedBy: String,
  approvedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.ReturnRequest || mongoose.model("ReturnRequest", returnRequestSchema);
