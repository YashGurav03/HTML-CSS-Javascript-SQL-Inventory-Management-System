const SALES_API = "http://localhost:5000/api/sales";

let dailyChartInstance = null;
let monthlyChartInstance = null;

/* ========================================
   INITIAL LOAD
======================================== */
document.addEventListener("DOMContentLoaded", () => {
  loadCharts();
  setInterval(loadCharts, 60000); // auto refresh
});


/* ========================================
   LOAD ALL CHARTS
======================================== */
async function loadCharts() {
  await Promise.all([
    loadDailyChart(),
    loadMonthlyChart()
  ]);
}


/* ========================================
   SAFE FETCH
======================================== */
async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Server error");
    return await res.json();
  } catch (err) {
    console.error("Chart fetch error:", err);
    return [];
  }
}


/* ========================================
   FORMAT CURRENCY
======================================== */
function formatCurrency(value) {
  return "₹" + Number(value).toLocaleString();
}


/* ========================================
   DAILY REVENUE CHART
======================================== */
async function loadDailyChart() {

  const canvas = document.getElementById("dailyChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const data = await fetchData(`${SALES_API}/daily-revenue`);

  const labels = data.map(d =>
    new Date(d.date).toLocaleDateString()
  );

  const values = data.map(d => Number(d.revenue));

  if (dailyChartInstance) dailyChartInstance.destroy();

  if (!values.length) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px Arial";
    ctx.fillText("No daily sales data", 20, 40);
    return;
  }

  dailyChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Daily Revenue",
        data: values,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => formatCurrency(ctx.raw)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => formatCurrency(value)
          }
        }
      }
    }
  });
}


/* ========================================
   MONTHLY REVENUE CHART
======================================== */
async function loadMonthlyChart() {

  const canvas = document.getElementById("monthlyChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const data = await fetchData(`${SALES_API}/monthly-revenue`);

  const labels = data.map(d => {
    const [year, month] = d.month.split("-");
    return new Date(year, month - 1).toLocaleString("default", {
      month: "short",
      year: "numeric"
    });
  });

  const values = data.map(d => Number(d.revenue));

  if (monthlyChartInstance) monthlyChartInstance.destroy();

  if (!values.length) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px Arial";
    ctx.fillText("No monthly sales data", 20, 40);
    return;
  }

  monthlyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Monthly Revenue",
        data: values,
        tension: 0.3,
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: ctx => formatCurrency(ctx.raw)
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => formatCurrency(value)
          }
        }
      }
    }
  });
}