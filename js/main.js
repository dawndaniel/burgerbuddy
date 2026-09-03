/* ============================================================
   BURGER BUDDY — shared app logic
   Theme toggle · Cart (localStorage) · WhatsApp ordering
   ============================================================ */

const WHATSAPP_NUMBER = "923062767340";

/* ---------- Product catalogue (single source of truth) ---------- */
const PRODUCTS = [
  { id: "burger-mega-cheese", name: "Mega Zinger Burger with Cheese", category: "burgers",
    price: 400, desc: "Our biggest zinger patty, melted cheese, house sauce, toasted bun.",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=70" },
  { id: "burger-mega-cheese-fries", name: "Mega Zinger Burger with Cheese & Fries", category: "burgers",
    price: 450, desc: "The Mega Zinger with cheese, paired with a hot side of crispy fries.",
    img: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=70" },
  { id: "burger-zinger", name: "Zinger Burger", category: "burgers",
    price: 350, desc: "Crispy fried chicken fillet, fresh lettuce, mayo, toasted bun.",
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=70" },
  { id: "burger-zinger-fries", name: "Zinger Burger with Fries", category: "burgers",
    price: 400, desc: "Classic Zinger Burger served with a golden side of fries.",
    img: "https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=800&q=70" },
  { id: "wings-4pc", name: "4 Pieces Crispy Wings", category: "wings",
    price: 200, desc: "Hand-breaded, fried to a crunch, tossed in Buddy's signature spice.",
    img: "https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=800&q=70" },
  { id: "wings-8pc", name: "8 Pieces Crispy Wings", category: "wings",
    price: 380, desc: "Double the crunch. Perfect for sharing (or not).",
    img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=70" },
  { id: "fries", name: "Fries", category: "fries",
    price: 100, desc: "Golden, crispy, salted just right.",
    img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=70" },
  { id: "addon-cheese", name: "Cheese Slice", category: "addons",
    price: 50, desc: "Extra melted cheese slice for any burger.",
    img: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?auto=format&fit=crop&w=800&q=70" },
  { id: "deal-buddy", name: "Buddy Deal", category: "deals",
    price: 999, desc: "2 Zinger Burgers, 4 pc Wings, 1 Fries, 2 Drinks (300ml).",
    img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=70" },
  { id: "deal-family", name: "Family Buddy Deal", category: "deals",
    price: 1900, desc: "4 Zinger Burgers, 8 pc Wings, 2 Fries, 1 Drink (1L).",
    img: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=70" },
];

function getProduct(id){ return PRODUCTS.find(p => p.id === id); }

/* ---------------------- THEME ---------------------- */
function initTheme(){
  const saved = localStorage.getItem("bb-theme");
  const theme = saved || "light";
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeIcon(theme);
}
function toggleTheme(){
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("bb-theme", next);
  updateThemeIcon(next);
}
function updateThemeIcon(theme){
  document.querySelectorAll(".theme-icon").forEach(el => {
    el.textContent = theme === "light" ? "🌙" : "☀️";
  });
}

/* ---------------------- CART STATE ---------------------- */
function getCart(){
  try{ return JSON.parse(localStorage.getItem("bb-cart")) || []; }
  catch(e){ return []; }
}
function saveCart(cart){
  localStorage.setItem("bb-cart", JSON.stringify(cart));
  renderCartCount();
}
function addToCart(id, qty){
  qty = qty || 1;
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing){ existing.qty += qty; }
  else { cart.push({ id, qty }); }
  saveCart(cart);
  renderCartDrawer();
  showToast(`Added to cart — ${getProduct(id) ? getProduct(id).name : "Item"}`);
}
function removeFromCart(id){
  saveCart(getCart().filter(i => i.id !== id));
  renderCartDrawer();
}
function setQty(id, qty){
  let cart = getCart();
  if (qty <= 0){ cart = cart.filter(i => i.id !== id); }
  else {
    const item = cart.find(i => i.id === id);
    if (item) item.qty = qty;
  }
  saveCart(cart);
  renderCartDrawer();
}
function cartTotal(cart){
  return cart.reduce((sum, i) => {
    const p = getProduct(i.id);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
}
function cartCount(cart){
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

/* ---------------------- RENDER: cart badge everywhere ---------------------- */
function renderCartCount(){
  const count = cartCount(getCart());
  document.querySelectorAll(".cart-count, .bn-count").forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

/* ---------------------- RENDER: cart drawer ---------------------- */
function renderCartDrawer(){
  const list = document.getElementById("cartItems");
  const summary = document.getElementById("cartSummary");
  if (!list) return;
  const cart = getCart();

  if (cart.length === 0){
    list.innerHTML = `<div class="cart-empty"><span class="emoji">🛒</span>Your cart is empty.<br>Go grab a Zinger!</div>`;
    if (summary) summary.style.display = "none";
    const proceedBtn = document.getElementById("proceedBtn");
    if (proceedBtn) proceedBtn.disabled = true;
    return;
  }

  list.innerHTML = cart.map(item => {
    const p = getProduct(item.id);
    if (!p) return "";
    return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <div class="cart-item-info">
          <h4>${p.name}</h4>
          <div class="cart-item-price">Rs. ${p.price} x ${item.qty} = Rs. ${p.price * item.qty}</div>
          <div class="qty-stepper" style="margin-top:6px;">
            <button aria-label="Decrease quantity" onclick="setQty('${p.id}', ${item.qty - 1})">−</button>
            <span>${item.qty}</span>
            <button aria-label="Increase quantity" onclick="setQty('${p.id}', ${item.qty + 1})">+</button>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart('${p.id}')">Remove</button>
        </div>
      </div>`;
  }).join("");

  const total = cartTotal(cart);
  if (summary){
    summary.style.display = "block";
    summary.innerHTML = `
      <div class="summary-row"><span>Subtotal</span><span>Rs. ${total}</span></div>
      <div class="summary-row total"><span>Total</span><span>Rs. ${total}</span></div>
      <button class="btn btn-primary btn-block" id="proceedBtn" style="margin-top:14px;" onclick="openCheckout()">PROCEED TO ORDER</button>
    `;
  }
}

/* ---------------------- CART DRAWER open/close ---------------------- */
function openCart(){
  renderCartDrawer();
  document.getElementById("cartOverlay").classList.add("open");
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("checkoutPanel").classList.remove("open");
  document.getElementById("cartItems").style.display = "block";
  document.getElementById("cartSummary").style.display = getCart().length ? "block" : "none";
}
function closeCart(){
  document.getElementById("cartOverlay").classList.remove("open");
  document.getElementById("cartDrawer").classList.remove("open");
}
function openCheckout(){
  if (getCart().length === 0) return;
  document.getElementById("cartItems").style.display = "none";
  document.getElementById("cartSummary").style.display = "none";
  document.getElementById("checkoutPanel").classList.add("open");
}
function backToCart(){
  document.getElementById("checkoutPanel").classList.remove("open");
  document.getElementById("cartItems").style.display = "block";
  document.getElementById("cartSummary").style.display = "block";
}

/* ---------------------- Delivery / pickup toggle ---------------------- */
function selectFulfilment(mode){
  document.querySelectorAll(".toggle-opt").forEach(el => el.classList.remove("active"));
  document.getElementById(`opt-${mode}`).classList.add("active");
  document.getElementById("fulfilmentInput").value = mode;
  const addrField = document.getElementById("addressField");
  if (addrField) addrField.style.display = mode === "delivery" ? "block" : "none";
  const locField = document.getElementById("locationField");
  if (locField) locField.style.display = mode === "delivery" ? "block" : "none";
}

/* ---------------------- Share live location ---------------------- */
function shareLocation(){
  const statusEl = document.getElementById("locationStatus");
  const btn = document.getElementById("shareLocationBtn");
  if (!statusEl) return;

  if (!navigator.geolocation){
    statusEl.textContent = "Location isn't supported on this device.";
    statusEl.style.color = "var(--red)";
    return;
  }

  statusEl.textContent = "Getting your location…";
  statusEl.style.color = "var(--text-soft)";
  if (btn) btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude.toFixed(6);
      const lng = pos.coords.longitude.toFixed(6);
      const link = `https://maps.google.com/?q=${lat},${lng}`;
      const hidden = document.getElementById("custLocationLink");
      if (hidden) hidden.value = link;
      statusEl.textContent = "Location shared — we've got your pin";
      statusEl.style.color = "var(--green)";
      if (btn){ btn.disabled = false; btn.textContent = "📍 Update My Location"; }
    },
    () => {
      statusEl.textContent = "Couldn't get your location. You can still add your address above.";
      statusEl.style.color = "var(--red)";
      if (btn) btn.disabled = false;
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

/* ---------------------- WhatsApp order ---------------------- */
function placeOrder(event){
  event.preventDefault();
  const cart = getCart();
  if (cart.length === 0) return;

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress") ? document.getElementById("custAddress").value.trim() : "";
  const locationLink = document.getElementById("custLocationLink") ? document.getElementById("custLocationLink").value.trim() : "";
  const notes = document.getElementById("custNotes").value.trim();
  const fulfilment = document.getElementById("fulfilmentInput").value || "delivery";

  if (!name || !phone){
    showToast("Please add your name and phone number");
    return;
  }

  let msg = "NEW BURGER BUDDY ORDER\n\n";
  msg += `Customer Name: ${name}\n`;
  msg += `Phone: ${phone}\n`;
  if (fulfilment === "delivery"){
    msg += `Address: ${address || "-"}\n`;
    if (locationLink) msg += `Location Pin: ${locationLink}\n`;
  }
  msg += `\nORDER:\n`;

  let subtotal = 0;
  cart.forEach(item => {
    const p = getProduct(item.id);
    if (!p) return;
    const lineTotal = p.price * item.qty;
    subtotal += lineTotal;
    msg += `${item.qty} x ${p.name} — Rs. ${lineTotal}\n`;
  });

  msg += `\nSubtotal: Rs. ${subtotal}\n`;
  msg += `\nDelivery/Pickup: ${fulfilment === "delivery" ? "Delivery" : "Pickup"}\n`;
  msg += `\nNotes:\n${notes || "-"}\n`;
  msg += `\nTOTAL: Rs. ${subtotal}\n\nThank you!`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");

  const locHidden = document.getElementById("custLocationLink");
  const locStatus = document.getElementById("locationStatus");
  const locBtn = document.getElementById("shareLocationBtn");
  if (locHidden) locHidden.value = "";
  if (locStatus){ locStatus.textContent = "No location shared yet"; locStatus.style.color = "var(--text-soft)"; }
  if (locBtn) locBtn.textContent = "📍 Share My Location";
}

/* ---------------------- Quick single-item WhatsApp order ---------------------- */
function quickOrder(id){
  const p = getProduct(id);
  if (!p) return;
  let msg = "NEW BURGER BUDDY ORDER\n\n";
  msg += `ORDER:\n1 x ${p.name} — Rs. ${p.price}\n\nSubtotal: Rs. ${p.price}\nTOTAL: Rs. ${p.price}\n\nThank you!`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

function orderDealOnWhatsapp(dealName, items, price){
  let msg = "NEW BURGER BUDDY ORDER\n\n";
  msg += `ORDER:\n1 x ${dealName} — Rs. ${price}\n(${items})\n\nSubtotal: Rs. ${price}\nTOTAL: Rs. ${price}\n\nThank you!`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

/* Deals now go through the cart like everything else, instead of ordering instantly */
function addDealToCart(id){
  addToCart(id, 1);
  openCart();
}

function generalWhatsappOrder(){
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Burger Buddy! I'd like to place an order.")}`;
  window.open(url, "_blank");
}

/* ---------------------- Toast ---------------------- */
let toastTimer;
function showToast(text){
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------------------- Mobile nav ---------------------- */
function openMobileNav(){ document.getElementById("mobileNav").classList.add("open"); }
function closeMobileNav(){ document.getElementById("mobileNav").classList.remove("open"); }

/* ---------------------- Render product grids from data ---------------------- */
function foodCardHTML(p, opts){
  opts = opts || {};
  const showQty = !!opts.qty;
  return `
    <article class="food-card" data-category="${p.category}">
      <div class="food-card-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <div class="price-tag"><small>Rs.</small>${p.price}</div>
      </div>
      <div class="food-card-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        ${showQty ? `
        <div class="qty-stepper" data-qty-for="${p.id}">
          <button aria-label="Decrease" onclick="stepLocalQty('${p.id}', -1)">−</button>
          <span id="qty-${p.id}">1</span>
          <button aria-label="Increase" onclick="stepLocalQty('${p.id}', 1)">+</button>
        </div>` : ``}
        <div class="card-actions">
          <button class="btn btn-primary btn-sm" onclick="addFromCard('${p.id}')">Add to Cart</button>
          <button class="btn btn-secondary btn-sm" onclick="quickOrder('${p.id}')">Quick Order</button>
        </div>
      </div>
    </article>`;
}
function stepLocalQty(id, delta){
  const el = document.getElementById(`qty-${id}`);
  if (!el) return;
  let val = parseInt(el.textContent, 10) + delta;
  if (val < 1) val = 1;
  el.textContent = val;
}
function addFromCard(id){
  const el = document.getElementById(`qty-${id}`);
  const qty = el ? parseInt(el.textContent, 10) : 1;
  addToCart(id, qty);
  if (el) el.textContent = 1;
}

function renderGrid(containerId, category){
  const el = document.getElementById(containerId);
  if (!el) return;
  const items = category && category !== "all" ? PRODUCTS.filter(p => p.category === category) : PRODUCTS.filter(p => p.category !== "deals");
  el.innerHTML = items.map(p => foodCardHTML(p, { qty: true })).join("");
}

/* ---------------------- Menu page filter tabs ---------------------- */
function initMenuFilters(){
  const tabs = document.querySelectorAll(".cat-tab");
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const cat = tab.dataset.cat;
      const grid = document.getElementById("menuGrid");
      const items = cat === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);
      grid.innerHTML = items.map(p => foodCardHTML(p, { qty: true })).join("");
    });
  });
}

/* ---------------------- Init on load ---------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderCartCount();
  renderCartDrawer();
  initMenuFilters();

  document.querySelectorAll(".theme-toggle").forEach(btn => btn.addEventListener("click", toggleTheme));
  const cartOverlay = document.getElementById("cartOverlay");
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

  // auto-populate homepage favorites grid if present
  if (document.getElementById("favoritesGrid")){
    const favIds = ["burger-mega-cheese","burger-mega-cheese-fries","burger-zinger","burger-zinger-fries","wings-4pc","wings-8pc","fries"];
    document.getElementById("favoritesGrid").innerHTML = favIds.map(id => foodCardHTML(getProduct(id), { qty: true })).join("");
  }
  // auto-populate full menu grid if present with default 'all'
  if (document.getElementById("menuGrid")){
    document.getElementById("menuGrid").innerHTML = PRODUCTS.map(p => foodCardHTML(p, { qty: true })).join("");
  }
});
