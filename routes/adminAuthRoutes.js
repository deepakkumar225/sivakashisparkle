import express from "express";

import {
  loginAdmin,
  getCurrentAdmin,
  forgotPasswordAdmin,
  verifyAdminOtp,
  resetAdminPassword,
} from "../controllers/adminAuthController.js";

import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================================
ADMIN AUTHENTICATION ROUTES
=========================================================
*/

// Admin Login
router.post("/login", loginAdmin);

// Forgot Password - Generate & Send OTP
router.post("/forgot-password", forgotPasswordAdmin);

// Verify OTP
router.post("/verify-otp", verifyAdminOtp);

// Reset Password with OTP
router.post("/reset-password", resetAdminPassword);

// Get current logged-in admin
router.get("/me", protectAdmin, getCurrentAdmin);

export default router;