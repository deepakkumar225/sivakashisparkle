import express from "express";

import {
  getSalesReport,
} from "../controllers/reportController.js";

import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================================
ADMIN - SALES REPORT
=========================================================
*/

router.get("/", protectAdmin, getSalesReport);

export default router;