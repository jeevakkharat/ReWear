const express = require("express");
const { body, param } = require("express-validator");
const { getProductReviews, addReview, updateReview, deleteReview } = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/product/:productId", [param("productId").notEmpty().withMessage("Product id is required.")], validateMiddleware, getProductReviews);
router.post(
  "/",
  authMiddleware,
  [
    body("productId").notEmpty().withMessage("Product id is required."),
    body("rating").isFloat({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5."),
    body("comment").trim().isLength({ min: 5 }).withMessage("Comment must be at least 5 characters long."),
  ],
  validateMiddleware,
  addReview
);
router.put(
  "/:id",
  authMiddleware,
  [
    param("id").notEmpty().withMessage("Review id is required."),
    body("rating").optional().isFloat({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5."),
    body("comment").optional().trim().isLength({ min: 5 }).withMessage("Comment must be at least 5 characters long."),
  ],
  validateMiddleware,
  updateReview
);
router.delete("/:id", authMiddleware, [param("id").notEmpty().withMessage("Review id is required.")], validateMiddleware, deleteReview);

module.exports = router;
