import express from "express";

import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../controllers/authController.js";

import { protectUser } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================================
CUSTOMER AUTHENTICATION ROUTES
=========================================================
*/

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get current logged-in user
router.get("/me", protectUser, getCurrentUser);

export default router;