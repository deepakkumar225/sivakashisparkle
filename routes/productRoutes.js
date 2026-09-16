import express from "express";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} from "../controllers/productController.js";

import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================================
PUBLIC PRODUCT ROUTES
=========================================================
*/

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);


/*
=========================================================
ADMIN PRODUCT ROUTES
=========================================================
*/

// Create product
router.post("/", protectAdmin, createProduct);

// Update product
router.put("/:id", protectAdmin, updateProduct);

// Delete product
router.delete("/:id", protectAdmin, deleteProduct);

// Activate / Deactivate product
router.patch(
  "/:id/status",
  protectAdmin,
  updateProductStatus
);

export default router;