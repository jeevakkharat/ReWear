const Product = require("../models/Product");
const Cart = require("../models/Cart");

const normalizeUserCart = async (userId) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  return cart;
};

const getCart = async (req, res, next) => {
  try {
    const cart = await normalizeUserCart(req.user._id);

    const cartItems = await Promise.all(
      (cart.items || []).map(async (item) => {
        const product = await Product.findById(item.productId);
        return product ? { ...product.toObject(), quantity: item.quantity } : null;
      })
    );

    const filteredCart = cartItems.filter(Boolean);
    const subtotal = filteredCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return res.json({
      success: true,
      cart: filteredCart,
      subtotal,
      shipping: subtotal >= 3000 || subtotal === 0 ? 0 : 120,
      total: subtotal >= 3000 || subtotal === 0 ? subtotal : subtotal + 120,
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body || {};
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const safeQuantity = Math.max(1, Number(quantity) || 1);
    const cart = await normalizeUserCart(req.user._id);
    const existingItem = cart.items.find((item) => item.productId.toString() === productId.toString());

    if (existingItem) {
      existingItem.quantity += safeQuantity;
    } else {
      cart.items.push({ productId: productId.toString(), quantity: safeQuantity });
    }

    await cart.save();

    return res.status(201).json({ success: true, message: "Product added to cart.", cart: cart.items });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body || {};
    const cart = await normalizeUserCart(req.user._id);
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === id.toString());

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not found in cart." });
    }

    const nextQty = Math.max(0, Number(quantity) || 0);

    if (nextQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = nextQty;
    }

    await cart.save();

    return res.json({ success: true, message: "Cart updated.", cart: cart.items });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cart = await normalizeUserCart(req.user._id);
    cart.items = (cart.items || []).filter((item) => item.productId.toString() !== id.toString());
    await cart.save();

    return res.json({ success: true, message: "Product removed from cart.", cart: cart.items });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await normalizeUserCart(req.user._id);
    cart.items = [];
    await cart.save();

    return res.json({ success: true, message: "Cart cleared." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
