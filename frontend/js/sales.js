const saleAPI = "http://localhost:5000/api/sales";
const productAPI = "http://localhost:5000/api/products";

/* =====================================
   SALE FORM SUBMIT
===================================== */
document.getElementById("saleForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const productId = document.getElementById("productId").value;
  const quantity = document.getElementById("quantitySold").value;
  const messageBox = document.getElementById("saleMessage");

  if (!productId || !quantity || quantity <= 0) {
    messageBox.textContent = "Enter valid product and quantity";
    messageBox.style.color = "red";
    return;
  }

  const sale = {
    product_id: Number(productId),
    quantity_sold: Number(quantity)
  };

  try {
    messageBox.textContent = "Recording sale...";
    messageBox.style.color = "black";

    const res = await fetch(saleAPI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sale)
    });

    if (!res.ok) throw new Error("Failed to record sale");

    const data = await res.json();

    messageBox.textContent = data.message || "Sale recorded successfully";
    messageBox.style.color = "green";

    e.target.reset();

    await Promise.all([
      loadProducts?.(),
      loadDashboard?.(),
      loadCharts?.()
    ]);

  } catch (err) {
    console.error(err);
    messageBox.textContent = "Error recording sale";
    messageBox.style.color = "red";
  }
});


/* =====================================
   PRODUCT DROPDOWN
===================================== */
async function loadProductDropdown() {
  try {
    const res = await fetch(productAPI);
    if (!res.ok) throw new Error("Failed to fetch products");

    const products = await res.json();
    const dropdown = document.getElementById("productId");

    dropdown.innerHTML = `<option value="">Select Product</option>`;

    products.forEach(p => {
      dropdown.innerHTML += `
        <option value="${p.id}">
          ${p.name} (Stock: ${p.quantity})
        </option>
      `;
    });

  } catch (err) {
    console.error("Failed to load products", err);
  }
}

loadProductDropdown();