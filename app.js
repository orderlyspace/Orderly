// ====== Orderly App Logic ======
const restaurantName = "Cafe Spice"; // later we’ll make it dynamic per QR
document.getElementById("restaurantName").textContent = restaurantName;

// Sample Menu (can be fetched from a file or database later)
const menuItems = [
  { name: "Masala Dosa", price: 120 },
  { name: "Cold Coffee", price: 80 },
  { name: "Veg Burger", price: 150 },
  { name: "Fries", price: 60 }
];

let order = [];

// Display menu
function loadMenu() {
  const menuDiv = document.getElementById("menuItems");
  menuItems.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("menu-item");
    div.innerHTML = `
      <span>${item.name} - ₹${item.price}</span>
      <button onclick="addToOrder(${index})">Add</button>
    `;
    menuDiv.appendChild(div);
  });
}

// Add item to order
function addToOrder(index) {
  order.push(menuItems[index]);
  renderOrder();
}

// Display order list
function renderOrder() {
  const orderList = document.getElementById("orderList");
  orderList.innerHTML = "";
  order.forEach((item, i) => {
    orderList.innerHTML += `<p>${item.name} - ₹${item.price}</p>`;
  });
}

// Place order
function placeOrder() {
  const tableNo = document.getElementById("tableNo").value.trim();
  if (!tableNo) {
    alert("Please enter your table number!");
    return;
  }

  if (order.length === 0) {
    alert("Please add some items to your order!");
    return;
  }

  const total = order.reduce((sum, item) => sum + item.price, 0);
  alert(`✅ Order placed!\nTable: ${tableNo}\nTotal: ₹${total}`);

  // In the future, send this data to Firebase
  order = [];
  renderOrder();
  document.getElementById("tableNo").value = "";
}

loadMenu();
