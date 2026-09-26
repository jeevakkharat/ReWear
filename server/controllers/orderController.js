const Order = require("../models/Order");
const Product = require("../models/Product");

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id.toString() }).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.userId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    return res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

const placeOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = "COD" } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    const productList = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) return null;

        return {
          productId: product._id.toString(),
          name: product.name,
          price: product.price,
          quantity: Number(item.quantity) || 1,
        };
      })
    );

    const validItems = productList.filter(Boolean);
    const subtotal = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 3000 || subtotal === 0 ? 0 : 120;
    const total = subtotal + shipping;

    const order = await Order.create({
      userId: req.user._id.toString(),
      customer: {
        fullName: req.user.fullName,
        email: req.user.email,
      },
      items: validItems,
      shippingAddress: shippingAddress || {},
      paymentMethod,
      subtotal,
      shipping,
      total,
      status: "Pending",
    });

    return res.status(201).json({ success: true, message: "Order placed successfully.", order });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    order.status = status || order.status;
    await order.save();

    return res.json({ success: true, message: "Order status updated.", order });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.userId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    order.status = "Cancelled";
    await order.save();

    return res.json({ success: true, message: "Order cancelled successfully.", order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserOrders,
  getOrderById,
  placeOrder,
  updateOrderStatus,
  cancelOrder,
};
