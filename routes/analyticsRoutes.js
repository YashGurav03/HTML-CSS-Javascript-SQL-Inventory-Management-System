const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* ---------------- MONTHLY REVENUE ---------------- */

router.get("/monthly-revenue", (req, res) => {
  const sql = `
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') AS month,
      SUM(total_price) AS revenue
    FROM sales
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Monthly revenue query error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});


/* ---------------- SALES BY PRODUCT ---------------- */

router.get("/sales-by-product", (req, res) => {
  const sql = `
    SELECT p.name, SUM(s.quantity_sold) AS total_sold
    FROM sales s
    JOIN products p ON p.id = s.product_id
    GROUP BY p.id, p.name
    ORDER BY total_sold DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Sales by product query error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

module.exports = router;