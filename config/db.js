const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "inventory_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection (async)
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("Connected to MySQL");
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

module.exports = db;