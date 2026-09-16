import express from "express";

import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  updateAdminProductStatus,
} from "../controllers/adminProductController.js";

import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================================
ADMIN - PRODUCT MANAGEMENT
=========================================================
*/

// Get all products
router.get("/", protectAdmin, getAdminProducts);

// Create product
router.post("/", protectAdmin, createAdminProduct);

// Update product
router.put("/:id", protectAdmin, updateAdminProduct);

// Delete product
router.delete("/:id", protectAdmin, deleteAdminProduct);

// Update product status
router.patch(
  "/:id/status",
  protectAdmin,
  updateAdminProductStatus
);

export default router;