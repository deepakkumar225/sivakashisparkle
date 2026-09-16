import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import productRoutes from "./routes/productRoutes.js";

import orderRoutes from "./routes/orderRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

import adminProductRoutes from "./routes/adminProductRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

/*
=========================================================
MIDDLEWARE
=========================================================
*/

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "public", "images")));


/*
=========================================================
BASIC ROUTES
=========================================================
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sivakashi Sparkle Backend API is running successfully!",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    database: "MongoDB connection is active",
    timestamp: new Date().toISOString(),
  });
});


/*
=========================================================
API ROUTES
=========================================================
*/

// Customer authentication
app.use("/api/auth", authRoutes);

// Admin authentication
app.use("/api/admin", adminAuthRoutes);

// Products
app.use("/api/products", productRoutes);
app.use("/api/admin/products", adminProductRoutes);

app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);

app.use("/api/admin/dashboard", dashboardRoutes);

app.use("/api/admin/reports", reportRoutes);


/*
=========================================================
404 ROUTE
=========================================================
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});


/*
=========================================================
ERROR HANDLER
=========================================================
*/

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});


/*
=========================================================
START SERVER
=========================================================
*/

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT,"0.0.0.0", () => {
      
      console.log(" Sivakashi Sparkle Backend");
      console.log(` Server running on: http://localhost:${PORT}`);
      console.log(
        ` Health check: http://localhost:${PORT}/api/health`
      );
      
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();