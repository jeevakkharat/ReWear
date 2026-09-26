const express = require("express");
const { body, param } = require("express-validator");
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getFeaturedProducts,
} = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", [param("id").notEmpty().withMessage("Product id is required.")], validateMiddleware, getProductById);
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  [
    body("name").trim().notEmpty().withMessage("Product name is required."),
    body("category").trim().notEmpty().withMessage("Category is required."),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a non-negative number."),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer."),
  ],
  validateMiddleware,
  addProduct
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [
    param("id").notEmpty().withMessage("Product id is required."),
    body("name").optional().trim().notEmpty().withMessage("Product name cannot be empty."),
    body("category").optional().trim().notEmpty().withMessage("Category cannot be empty."),
    body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a non-negative number."),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer."),
  ],
  validateMiddleware,
  updateProduct
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").notEmpty().withMessage("Product id is required.")],
  validateMiddleware,
  deleteProduct
);

module.exports = router;
