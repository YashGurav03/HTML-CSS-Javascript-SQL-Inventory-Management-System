const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const salesRoutes = require("./routes/salesRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

/* ---------------- SECURITY + CORE MIDDLEWARE ---------------- */

// Security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Logging
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Parse JSON (must be before routes)
app.use(express.json());


/* ---------------- ROUTES ---------------- */

app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "API running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date()
  });
});


/* ---------------- 404 HANDLER ---------------- */

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


/* ---------------- GLOBAL ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error("Error:", err.stack || err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});


/* ---------------- SERVER START ---------------- */

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
====================================
 Server running on port ${PORT}
 Mode: ${process.env.NODE_ENV || "development"}
====================================
`);
});


/* ---------------- GRACEFUL SHUTDOWN ---------------- */

const shutdown = () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);