const express = require("express");
const { body, param } = require("express-validator");
const {
  getUserOrders,
  getOrderById,
  placeOrder,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getUserOrders);
router.get("/:id", authMiddleware, [param("id").notEmpty().withMessage("Order id is required.")], validateMiddleware, getOrderById);
router.post(
  "/",
  authMiddleware,
  [
    body("items").isArray({ min: 1 }).withMessage("At least one item is required to place an order."),
    body("items.*.productId").notEmpty().withMessage("Each order item must include a product id."),
    body("items.*.quantity").optional().isInt({ min: 1 }).withMessage("Each item quantity must be at least 1."),
  ],
  validateMiddleware,
  placeOrder
);
router.put(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  [
    param("id").notEmpty().withMessage("Order id is required."),
    body("status").trim().notEmpty().withMessage("Order status is required."),
  ],
  validateMiddleware,
  updateOrderStatus
);
router.delete("/:id", authMiddleware, [param("id").notEmpty().withMessage("Order id is required.")], validateMiddleware, cancelOrder);

module.exports = router;
