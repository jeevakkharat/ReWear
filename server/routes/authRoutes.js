const express = require("express");
const { body } = require("express-validator");
const { registerUser, loginUser, getProfile, updateProfile, changePassword, logoutUser } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const validateMiddleware = require("../middleware/validateMiddleware");

const router = express.Router();

router.post(
  "/register",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("phone").trim().notEmpty().withMessage("Phone number is required."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long."),
    body("confirmPassword").custom((value, { req }) => value === req.body.password || Promise.reject("Passwords do not match.")),
    body("category").trim().notEmpty().withMessage("Category is required."),
    body("agreeTerms").isBoolean().withMessage("You must agree to the terms."),
  ],
  validateMiddleware,
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validateMiddleware,
  loginUser
);

router.get("/profile", authMiddleware, getProfile);
router.put(
  "/profile",
  authMiddleware,
  [
    body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty."),
    body("phone").optional().trim().notEmpty().withMessage("Phone cannot be empty."),
    body("category").optional().trim().notEmpty().withMessage("Category cannot be empty."),
  ],
  validateMiddleware,
  updateProfile
);
router.put(
  "/change-password",
  authMiddleware,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required."),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long."),
  ],
  validateMiddleware,
  changePassword
);
router.post("/logout", authMiddleware, logoutUser);

module.exports = router;
