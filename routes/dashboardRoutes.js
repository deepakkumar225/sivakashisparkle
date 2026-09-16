import express from "express";

import {
  getDashboardStats,
} from "../controllers/dashboardController.js";

import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================================
ADMIN - DASHBOARD STATISTICS
=========================================================
*/

router.get("/", protectAdmin, getDashboardStats);

export default router;