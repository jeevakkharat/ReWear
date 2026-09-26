const express = require("express");
const { body, param } = require("express-validator");
const {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:id", [param("id").notEmpty().withMessage("Category id is required.")], validateMiddleware, getCategoryById);
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  [body("name").trim().notEmpty().withMessage("Category name is required.")],
  validateMiddleware,
  addCategory
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [
    param("id").notEmpty().withMessage("Category id is required."),
    body("name").optional().trim().notEmpty().withMessage("Category name cannot be empty."),
  ],
  validateMiddleware,
  updateCategory
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").notEmpty().withMessage("Category id is required.")],
  validateMiddleware,
  deleteCategory
);

module.exports = router;
