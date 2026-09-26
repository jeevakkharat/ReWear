const express = require("express");
const { body, param } = require("express-validator");
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post(
  "/add",
  authMiddleware,
  [
    body("productId").notEmpty().withMessage("Product ID is required."),
    body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1."),
  ],
  validateMiddleware,
  addToCart
);
router.put(
  "/update/:id",
  authMiddleware,
  [
    param("id").notEmpty().withMessage("Product ID is required."),
    body("quantity").isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer."),
  ],
  validateMiddleware,
  updateCartItem
);
router.delete("/remove/:id", authMiddleware, [param("id").notEmpty().withMessage("Product ID is required.")], validateMiddleware, removeCartItem);
router.delete("/clear", authMiddleware, clearCart);

module.exports = router;
