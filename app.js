/* Orderly - core JS (light theme) */
/* Menu for now is in-memory. Later we will load from sheet/database. */

const urlParams = new URLSearchParams(window.location.search);
const paramRestaurant = urlParams.get('restaurant') || urlParams.get('rest') || '';
const paramTable = urlParams.get('table') || urlParams.get('t') || '';
const ownerPhone = urlParams.get('owner') || urlParams.get('ownerPhone') || ''; // e.g. 919900112233

// Basic config
const DEFAULT_RESTAURANT = paramRestaurant || "Orderly Restaurant";
document.getElementById('restaurantName').textContent = DEFAULT_RESTAURANT;
document.getElementById('restaurantNameSmall').textContent = DEFAULT_RESTAURANT;
if(paramTable) {
  document.getElementById('tableNo').value = paramTable;
  document.getElementById('tableBadge').textContent = paramTable;
} else {
  document.getElementById('tableBadge').textContent = "—";
}

let cart = [];

// Example menu — keep concise for T1 customers; will later be dynamic fetch
const menuItems = [
  { id: 'm1', name: "Masala Dosa", desc: "Crispy dosa with potato filling", price: 120 },
  { id: 'm2', name: "Cold Coffee", desc: "Chilled & creamy", price: 80 },
  { id: 'm3', name: "Paneer Butter Masala", desc: "Creamy tomato gravy", price: 210 },
  { id: 'm4', name: "Margherita Pizza", desc: "Thin crust cheese pizza", price: 250 }
];

function renderMenu(){
  const out = document.getElementById('menuItems');
  out.innerHTML = '';
  menuItems.forEach((m, i) => {
    const card = document.createElement('div'); card.className = 'menu-card';
    card.innerHTML = `
      <div class="menu-row">
        <div>
          <div class="menu-name">${escapeHtml(m.name)}</div>
          <div class="menu-desc">${escapeHtml(m.desc)}</div>
        </div>
        <div style="text-align:right">
          <div class="menu-price">₹ ${m.price}</div>
          <div style="margin-top:8px"><button class="btn primary" onclick="addToCart('${m.id}')">Add</button></div>
        </div>
      </div>
    `;
    out.appendChild(card);
  });
}

function addToCart(id){
  const item = menuItems.find(x=>x.id===id);
  if(!item) return;
  const idx = cart.findIndex(c=>c.id===id);
  if(idx >= 0) cart[idx].qty++;
  else cart.push({id:item.id, name:item.name, price:item.price, qty:1});
  renderCart();
}

function removeFromCart(id){
  const idx = cart.findIndex(c=>c.id===id);
  if(idx === -1) return;
  cart.splice(idx, 1);
  renderCart();
}

function changeQty(id, delta){
  const idx = cart.findIndex(c=>c.id===id);
  if(idx === -1) return;
  cart[idx].qty += delta;
  if(cart[idx].qty <= 0) cart.splice(idx,1);
  renderCart();
}

function renderCart(){
  const list = document.getElementById('orderList');
  list.innerHTML = '';
  if(cart.length === 0){
    list.innerHTML = '<div class="small">Cart is empty</div>';
    return;
  }
  cart.forEach(ci => {
    const div = document.createElement('div'); div.className = 'order-item';
    div.innerHTML = `
      <div>
        <div style="font-weight:700">${escapeHtml(ci.name)} <span style="font-weight:600;color:var(--muted);font-size:13px">x ${ci.qty}</span></div>
        <div class="small">₹ ${ci.price} each</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700">₹ ${ci.price * ci.qty}</div>
        <div style="margin-top:6px">
          <button class="remove" onclick="changeQty('${ci.id}', -1)">-</button>
          <button class="remove" onclick="changeQty('${ci.id}', 1)">+</button>
          <button class="remove" onclick="removeFromCart('${ci.id}')">Remove</button>
        </div>
      </div>
    `;
    list.appendChild(div);
  });
  // show totals
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const totalDiv = document.createElement('div'); totalDiv.style.marginTop='10px'; totalDiv.style.fontWeight='800';
  totalDiv.textContent = `Total: ₹ ${total}`;
  list.appendChild(totalDiv);
}

// helper: escape
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

// Clear cart
document.getElementById('clearCart').addEventListener('click', ()=>{
  if(confirm('Clear all items from cart?')){ cart=[]; renderCart(); }
});

// Place order: for now build text and optionally open WhatsApp to owner
document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);

function placeOrder(){
  const custName = document.getElementById('custName').value.trim();
  const tableNo = document.getElementById('tableNo').value.trim();
  const phone = document.getElementById('phone').value.trim();
  if(!custName){ alert('Please enter your name'); return; }
  if(!tableNo){ if(!confirm('Table number is empty — continue without table?')) return; }

  if(cart.length === 0){ alert('Your cart is empty'); return; }

  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const itemsText = cart.map(c=>`${c.name} x${c.qty} — ₹${c.price*c.qty}`).join('; ');

  const orderObj = {
    restaurant: DEFAULT_RESTAURANT,
    table: tableNo || '(not specified)',
    guest: custName,
    phone: phone || '(not provided)',
    items: itemsText,
    total: total,
    time: new Date().toLocaleString()
  };

  // For now: copy to clipboard (owner can read), show success, and open WhatsApp if owner phone provided
  const orderText = `New order for ${orderObj.restaurant}\nTable: ${orderObj.table}\nGuest: ${orderObj.guest}\nPhone: ${orderObj.phone}\nItems: ${orderObj.items}\nTotal: ₹${orderObj.total}\nTime: ${orderObj.time}\n\nPowered by Orderly`;
  navigator.clipboard && navigator.clipboard.writeText(orderText).catch(()=>{ /* ignore */ });

  // If owner phone present, open WhatsApp with message
  if(ownerPhone){
    // Ensure phone is in international format without + or leading zeros (assume user passes like 9198xxxx)
    const phoneClean = ownerPhone.replace(/\D/g,'');
    const waText = encodeURIComponent(orderText);
    const waUrl = `https://wa.me/${phoneClean}?text=${waText}`;
    window.open(waUrl, '_blank');
    showOrderConfirmation('Order sent via WhatsApp (opens in new tab). Order copied to clipboard.');
  } else {
    showOrderConfirmation('Order created locally and copied to clipboard. (No owner phone set — add owner=phone in QR to auto-send.)');
  }

  // Reset cart and fields
  cart = []; renderCart();
  document.getElementById('custName').value = '';
  document.getElementById('phone').value = '';
}

function showOrderConfirmation(msg){
  const el = document.getElementById('orderMsg');
  el.textContent = msg;
  setTimeout(()=>el.textContent = '', 6000);
}

/* init */
renderMenu();
renderCart();
