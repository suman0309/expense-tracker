let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart;

// Save transactions to localStorage
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Render transaction list
function renderTransactions() {
  const list = document.getElementById("transaction-list");
  list.innerHTML = "";
  transactions.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${t.desc} - 
      <span style="color:${t.amount >= 0 ? 'lightgreen' : 'salmon'}">
        ₹${t.amount}
      </span> (${t.category}) <small>${t.date}</small>
      <button onclick="deleteTransaction(${t.id})">🗑️</button>
    `;
    list.appendChild(li);
  });
}

// Update summary section
function updateSummary() {
  const income = transactions.filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);

  document.getElementById("income").textContent = `₹${income}`;
  document.getElementById("expense").textContent = `₹${Math.abs(expense)}`;
  document.getElementById("balance").textContent = `₹${income + expense}`;
}

// Update chart with animation
function updateChart() {
  const categorySums = {};
  transactions.filter(t => t.amount < 0).forEach(t => {
    categorySums[t.category] = (categorySums[t.category] || 0) + Math.abs(t.amount);
  });

  const ctx = document.getElementById("spendingChart").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(categorySums),
      datasets: [{
        data: Object.values(categorySums),
        backgroundColor: ['#f44336', '#2196f3', '#ff9800', '#4caf50']
      }]
    },
    options: {
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  });
}

// Delete a transaction
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  renderTransactions();
  updateSummary();
  updateChart();
}

// Add new transaction
document.getElementById("add-btn").addEventListener("click", () => {
  const desc = document.getElementById("desc").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;

  if (!desc || isNaN(amount)) {
    alert("Please enter valid details");
    return;
  }

  const transaction = {
    id: Date.now(),
    desc,
    amount: type === "expense" ? -Math.abs(amount) : Math.abs(amount),
    category,
    date: new Date().toLocaleDateString()
  };

  transactions.push(transaction);
  saveTransactions();
  renderTransactions();
  updateSummary();
  updateChart();

  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
});

// 🌙 Dark Mode toggle
document.getElementById("darkModeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

// Load dark mode preference
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

// 📄 Export to CSV
document.getElementById("exportCSV").addEventListener("click", () => {
  if (transactions.length === 0) {
    alert("No transactions to export!");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Description,Amount,Category,Date\n";
  transactions.forEach(t => {
    csvContent += `${t.desc},${t.amount},${t.category},${t.date}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "transactions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Initial load
renderTransactions();
updateSummary();
updateChart();
