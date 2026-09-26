const express = require("express");
const { body, param } = require("express-validator");
const { getAllUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, getAllUsers);
router.get("/:id", authMiddleware, adminMiddleware, [param("id").notEmpty().withMessage("User id is required.")], validateMiddleware, getUserById);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [
    param("id").notEmpty().withMessage("User id is required."),
    body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty."),
    body("phone").optional().trim().notEmpty().withMessage("Phone cannot be empty."),
    body("category").optional().trim().notEmpty().withMessage("Category cannot be empty."),
  ],
  validateMiddleware,
  updateUser
);
router.delete("/:id", authMiddleware, adminMiddleware, [param("id").notEmpty().withMessage("User id is required.")], validateMiddleware, deleteUser);

module.exports = router;
