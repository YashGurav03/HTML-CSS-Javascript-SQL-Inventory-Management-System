const apiURL = "http://localhost:5000/api/products";

let editId = null;


/* =====================================
   INIT AFTER DOM LOAD
===================================== */
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("productForm");
  const table = document.getElementById("productTable");
  const submitBtn = form?.querySelector("button");

  if (!form || !table || !submitBtn) {
    console.error("Product UI elements not found");
    return;
  }


  /* =====================================
     FORM SUBMIT
  ===================================== */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const product = {
      name: document.getElementById("name").value.trim(),
      category: document.getElementById("category").value.trim() || null,
      price: Number(document.getElementById("price").value),
      quantity: Number(document.getElementById("quantity").value)
    };

    if (!product.name || product.price < 0 || product.quantity < 0) {
      alert("Please enter valid product data");
      return;
    }

    try {
      submitBtn.innerText = "Saving...";

      const url = editId ? `${apiURL}/${editId}` : apiURL;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });

      if (!res.ok) throw new Error("Save failed");

      form.reset();
      editId = null;
      submitBtn.innerText = "Add Product";

      loadProducts();
      if (typeof loadDashboard === "function") loadDashboard();

    } catch (err) {
      console.error(err);
      alert("Error saving product");
      submitBtn.innerText = "Add Product";
    }
  });


  /* =====================================
     LOAD PRODUCTS
  ===================================== */
  async function loadProducts() {
    try {
      table.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

      const res = await fetch(apiURL);
      if (!res.ok) throw new Error("Load failed");

      const data = await res.json();

      if (!data.length) {
        table.innerHTML = "<tr><td colspan='5'>No products found</td></tr>";
        return;
      }

      table.innerHTML = data.map(p => {
        const lowStock = p.quantity < 5 ? "background:#ffe5e5" : "";
        return `
  <tr style="${lowStock}">
    <td>${p.id}</td>
    <td>${p.name}</td>
    <td>${p.category}</td>
    <td>₹${Number(p.price).toFixed(2)}</td>
    <td>${p.quantity}</td>
    <td>
      <button onclick="editProduct(${p.id})">Edit</button>
      <button onclick="deleteProduct(${p.id})">Delete</button>
    </td>
  </tr>
`;
      }).join("");

    } catch (err) {
      console.error(err);
      table.innerHTML = "<tr><td colspan='5'>Error loading products</td></tr>";
    }
  }


  /* =====================================
     DELETE PRODUCT
  ===================================== */
  window.deleteProduct = async function(id) {
    if (!confirm("Delete this product?")) return;

    try {
      const res = await fetch(`${apiURL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      loadProducts();
      if (typeof loadDashboard === "function") loadDashboard();

    } catch (err) {
      console.error(err);
      alert("Error deleting product");
    }
  }


  /* =====================================
     EDIT PRODUCT
  ===================================== */
  window.editProduct = async function(id) {
    try {
      const res = await fetch(`${apiURL}/${id}`);
      if (!res.ok) throw new Error("Fetch failed");

      const product = await res.json();

      document.getElementById("name").value = product.name;
      document.getElementById("category").value = product.category || "";
      document.getElementById("price").value = product.price;
      document.getElementById("quantity").value = product.quantity;

      editId = id;
      submitBtn.innerText = "Update Product";

    } catch (err) {
      console.error(err);
      alert("Error loading product");
    }
  }


  /* =====================================
     INITIAL LOAD
  ===================================== */
  loadProducts();
  if (typeof loadDashboard === "function") loadDashboard();

});