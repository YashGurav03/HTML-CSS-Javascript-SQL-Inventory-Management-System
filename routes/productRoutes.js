const express = require("express");
const router = express.Router();
const db = require("../config/db");

/* ================= LOW STOCK PRODUCTS ================= */

router.get("/low-stock", async (req, res) => {
  try {
    const threshold = req.query.limit || 5;

    const [rows] = await db.query(
      "SELECT * FROM products WHERE quantity < ? ORDER BY quantity ASC",
      [threshold]
    );

    res.json(rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


/* ================= GET ALL PRODUCTS ================= */

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    res.json(rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


/* ================= GET SINGLE PRODUCT ================= */

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Product not found" });

    res.json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


/* ================= ADD PRODUCT ================= */

router.post("/", async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;

    if (!name || price == null || quantity == null)
      return res.status(400).json({ message: "Required fields missing" });

    if (price < 0 || quantity < 0)
      return res.status(400).json({ message: "Invalid values" });

    await db.query(
      `INSERT INTO products (name, category, price, quantity)
       VALUES (?, ?, ?, ?)`,
      [name, category || null, price, quantity]
    );

    res.json({ message: "Product added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


/* ================= UPDATE PRODUCT ================= */

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity } = req.body;

    if (!name || price == null || quantity == null)
      return res.status(400).json({ message: "Required fields missing" });

    const [result] = await db.query(
      `UPDATE products
       SET name=?, category=?, price=?, quantity=?
       WHERE id=?`,
      [name, category || null, price, quantity, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


/* ================= DELETE PRODUCT ================= */

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  try {
    const res = await fetch(`${apiURL}/${id}`, { method: "DELETE" });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Delete failed");
    }

    alert(data.message);
    loadProducts();

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}