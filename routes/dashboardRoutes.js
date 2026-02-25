const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* ---------------- DASHBOARD STATS ---------------- */

router.get("/stats", async (req, res) => {
  try {
    const [products] = await db.query(
      "SELECT COUNT(*) AS total FROM products"
    );

    const [revenue] = await db.query(
      "SELECT SUM(total_price) AS total FROM sales"
    );

    res.json({
      totalProducts: products[0].total || 0,
      totalRevenue: revenue[0].total || 0
    });

  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Database error" });
  }
});


/* ---------------- DAILY REVENUE ---------------- */

router.get("/daily-revenue", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DATE(created_at) AS date, SUM(total_price) AS revenue
      FROM sales
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json(rows);

  } catch (err) {
    console.error("Daily revenue error:", err);
    res.status(500).json({ message: "Database error" });
  }
});


/* ---------------- MONTHLY REVENUE ---------------- */

router.get("/monthly-revenue", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DATE_FORMAT(created_at,'%Y-%m') AS month, SUM(total_price) AS revenue
      FROM sales
      GROUP BY DATE_FORMAT(created_at,'%Y-%m')
      ORDER BY month
    `);

    res.json(rows);

  } catch (err) {
    console.error("Monthly revenue error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;