const API = "http://localhost:5000/api";

let topProductsChart = null;
let categoryChart = null;


/* ======================================
   INIT
====================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  loadTopProductsChart();
  loadCategoryChart();

  setInterval(loadDashboard, 60000);
});


/* ======================================
   SAFE FETCH
====================================== */
async function safeFetch(url, fallback = []) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return fallback;
  }
}


/* ======================================
   FORMAT MONEY
====================================== */
function money(v) {
  return "₹" + Number(v).toLocaleString(undefined, {
    minimumFractionDigits: 2
  });
}


/* ======================================
   MAIN DASHBOARD
====================================== */
async function loadDashboard() {

  const products = await safeFetch(`${API}/products`, []);
  const summary = await safeFetch(`${API}/sales/summary`, {});

  const elProducts = document.getElementById("totalProducts");
  const elRevenue = document.getElementById("totalRevenue");
  const elSales = document.getElementById("totalSales");
  const elToday = document.getElementById("todayRevenue");
  const elMonth = document.getElementById("monthRevenue");

  if (elProducts) elProducts.textContent = products.length;
  if (elRevenue) elRevenue.textContent = money(summary.total_revenue || 0);
  if (elSales) elSales.textContent = summary.total_sales || 0;
  if (elToday) elToday.textContent = money(summary.today_revenue || 0);
  if (elMonth) elMonth.textContent = money(summary.month_revenue || 0);

  loadLowStock();
}


/* ======================================
   LOW STOCK LIST
====================================== */
async function loadLowStock() {
  const data = await safeFetch(`${API}/products/low-stock`, []);
  const list = document.getElementById("lowStockList");
  if (!list) return;

  list.innerHTML = data.length
    ? data.map(p => `<li>${p.name} (${p.quantity})</li>`).join("")
    : "<li>No low stock items</li>";
}


/* ======================================
   TOP PRODUCTS CHART
====================================== */
async function loadTopProductsChart() {

  const canvas = document.getElementById("topProductsChart");
  if (!canvas) return;

  const data = await safeFetch(`${API}/sales/top-products`, []);

  if (topProductsChart) topProductsChart.destroy();

  if (!data.length) return;

  topProductsChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: "Units Sold",
        data: data.map(d => d.total_sold)
      }]
    },
    options: { responsive: true }
  });
}


/* ======================================
   CATEGORY REVENUE PIE
====================================== */
async function loadCategoryChart() {

  const canvas = document.getElementById("categoryChart");
  if (!canvas) return;

  const data = await safeFetch(`${API}/sales/category-revenue`, []);

  if (categoryChart) categoryChart.destroy();

  if (!data.length) return;

  categoryChart = new Chart(canvas, {
    type: "pie",
    data: {
      labels: data.map(d => d.category),
      datasets: [{
        data: data.map(d => d.revenue)
      }]
    },
    options: { responsive: true }
  });
}