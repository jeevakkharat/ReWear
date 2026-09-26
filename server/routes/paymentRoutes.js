const express = require("express");
const { body, param } = require("express-validator");
const { createPaymentOrder, verifyPayment, getPaymentDetails } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");

const router = express.Router();

router.post(
  "/create-order",
  authMiddleware,
  [
    body("userId").notEmpty().withMessage("User ID is required."),
    body("orderId").notEmpty().withMessage("Order ID is required."),
    body("amount").isNumeric().withMessage("Amount must be numeric."),
  ],
  validateMiddleware,
  createPaymentOrder
);

router.post(
  "/verify",
  authMiddleware,
  [
    body("paymentId").notEmpty().withMessage("Payment ID is required."),
    body("orderId").notEmpty().withMessage("Order ID is required."),
  ],
  validateMiddleware,
  verifyPayment
);

router.get(
  "/:id",
  authMiddleware,
  [param("id").notEmpty().withMessage("Payment ID is required.")],
  validateMiddleware,
  getPaymentDetails
);

module.exports = router;
