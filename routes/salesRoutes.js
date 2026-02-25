const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* ================= CATEGORY REVENUE ================= */
router.get("/category-revenue", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.category, SUM(s.total_price) AS revenue
      FROM sales s
      JOIN products p ON s.product_id = p.id
      GROUP BY p.category
      ORDER BY revenue DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


/* ================= RECORD SALE ================= */
router.post("/", async (req, res) => {
  const { product_id, quantity_sold } = req.body;

  if (!product_id || !quantity_sold) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [products] = await connection.query(
      "SELECT * FROM products WHERE id = ?",
      [product_id]
    );

    if (!products.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    const product = products[0];

    if (product.quantity < quantity_sold) {
      await connection.rollback();
      return res.status(400).json({ message: "Not enough stock" });
    }

    const total_price = product.price * quantity_sold;

    await connection.query(
      "UPDATE products SET quantity = quantity - ? WHERE id = ?",
      [quantity_sold, product_id]
    );

    await connection.query(
      `INSERT INTO sales (product_id, quantity_sold, total_price)
       VALUES (?, ?, ?)`,
      [product_id, quantity_sold, total_price]
    );

    await connection.commit();

    res.json({ message: "Sale recorded successfully" });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: "Sale failed" });

  } finally {
    connection.release();
  }
});

/* =========================================
   SALES SUMMARY (DASHBOARD)
========================================= */
router.get("/summary", async (req, res) => {
  try {
    const connection = await db.getConnection();

    // total revenue + total sales
    const [totals] = await connection.query(`
      SELECT 
        COUNT(*) AS total_sales,
        COALESCE(SUM(total_price), 0) AS total_revenue
      FROM sales
    `);

    // today revenue
    const [today] = await connection.query(`
      SELECT COALESCE(SUM(total_price), 0) AS today_revenue
      FROM sales
      WHERE DATE(created_at) = CURDATE()
    `);

    // month revenue
    const [month] = await connection.query(`
      SELECT COALESCE(SUM(total_price), 0) AS month_revenue
      FROM sales
      WHERE MONTH(created_at) = MONTH(CURDATE())
      AND YEAR(created_at) = YEAR(CURDATE())
    `);

    connection.release();

    res.json({
      total_sales: totals[0].total_sales,
      total_revenue: totals[0].total_revenue,
      today_revenue: today[0].today_revenue,
      month_revenue: month[0].month_revenue
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Summary fetch failed" });
  }
});

module.exports = router;