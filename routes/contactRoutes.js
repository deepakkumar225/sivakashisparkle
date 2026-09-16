import express from "express";

import {
  createContactMessage,
  getContactMessages,
  updateContactMessageStatus,
} from "../controllers/contactController.js";

import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================================
CUSTOMER - SEND CONTACT MESSAGE
=========================================================
*/

router.post("/", createContactMessage);


/*
=========================================================
ADMIN - VIEW CONTACT MESSAGES
=========================================================
*/

router.get("/admin", protectAdmin, getContactMessages);


/*
=========================================================
ADMIN - UPDATE CONTACT MESSAGE STATUS
=========================================================
*/

router.patch(
  "/admin/:id/status",
  protectAdmin,
  updateContactMessageStatus
);

export default router;