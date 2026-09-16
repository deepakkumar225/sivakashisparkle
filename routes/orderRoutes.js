import express from "express";

import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getAvailableCoupons,
  validateCoupon,
} from "../controllers/orderController.js";

import {
  protectUser,
  protectAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================================
COUPON ROUTES
=========================================================
*/

// Get available coupons
router.get("/coupons", getAvailableCoupons);

// Validate a coupon code against subtotal
router.post("/validate-coupon", validateCoupon);

/*
=========================================================
CUSTOMER ORDER ROUTES
=========================================================
*/

// Create a new order
router.post("/", protectUser, createOrder);

// Get logged-in customer's orders
router.get("/my-orders", protectUser, getMyOrders);

// Get one order belonging to logged-in customer
router.get("/my-orders/:id", protectUser, getMyOrderById);


/*
=========================================================
ADMIN ORDER ROUTES
=========================================================
*/

// Get all orders
router.get("/admin", protectAdmin, getAllOrders);

// Get one order
router.get("/admin/:id", protectAdmin, getAdminOrderById);

// Update order status
router.patch(
  "/admin/:id/status",
  protectAdmin,
  updateOrderStatus
);

// Update payment status
router.patch(
  "/admin/:id/payment",
  protectAdmin,
  updatePaymentStatus
);

export default router;