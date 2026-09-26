const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: String,
  customer: Object,
  items: [{ productId: String, name: String, price: Number, quantity: Number }],
  shippingAddress: Object,
  paymentMethod: String,
  subtotal: Number,
  shipping: Number,
  total: Number,
  status: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
