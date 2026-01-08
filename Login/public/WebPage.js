let allProducts = [];
let cart = [];

// 1. Fetch from your real backend
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/allproduct');
        const data = await response.json();
        // Since your response is an object, we grab the array
        allProducts = Array.isArray(data) ? data : data.products || data.data || [];
        renderGrid(allProducts);
    } catch (err) {
        console.error("Backend offline:", err);
    }
}

// 2. Render Products
function renderGrid(list) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = list.map(p => `
        <div class="product-card" id="card-${p._id}">
            <div class="img-box">
                <img src="${p.images[0]}" id="img-${p._id}">
            </div>
            <h3 style="font-size:18px; margin-bottom:5px;">${p.name}</h3>
            <p style="color:#64748b; font-size:12px; margin-bottom:10px;">Range: ₹${p.minPrice} - ₹${p.maxPrice}</p>
            
            <div style="margin-bottom:15px">
                ${p.variants.map((v, i) => `
                    <button class="v-pill ${i===0?'active':''}" 
                        onclick="updateVariant('${p._id}', '${v.price}', '${v.imageUrl}', this)">
                        ${v.label}
                    </button>
                `).join('')}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                <span style="font-size:22px; font-weight:800; color:var(--primary)">₹<span id="price-${p._id}">${p.variants[0].price}</span></span>
                <div style="display:flex; gap:8px;">
                    <button class="btn-cart-add" onclick="addToCart('${p._id}', '${p.name}')"><i class="fa-solid fa-cart-plus"></i></button>
                    <button class="btn-buy" onclick="toggleCart()">Buy Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 3. Variant Switcher
function updateVariant(pid, price, img, btn) {
    document.getElementById(`price-${pid}`).innerText = price;
    if(img && img !== "undefined") document.getElementById(`img-${pid}`).src = img;
    btn.parentElement.querySelectorAll('.v-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// 4. Search & Filter
function searchProducts() {
    const query = document.getElementById('productSearch').value.toLowerCase();
    const filtered = allProducts.filter(p => p.name.toLowerCase().includes(query));
    renderGrid(filtered);
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    event.target.classList.add('active');
    
    if(cat === 'all') return renderGrid(allProducts);
    const filtered = allProducts.filter(p => p.name.toUpperCase() === cat.toUpperCase());
    renderGrid(filtered);
}

// 5. Cart Functions
function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

function addToCart(id, name) {
    const price = document.getElementById(`price-${id}`).innerText;
    const img = document.getElementById(`img-${id}`).src;
    const variant = document.getElementById(`card-${id}`).querySelector('.v-pill.active').innerText;

    cart.push({ id, name, price, img, variant });
    updateCartUI();
    showPopup(name, price);
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const list = document.getElementById('cart-items');
    let total = 0;

    list.innerHTML = cart.map((item, index) => {
        total += parseInt(item.price);
        return `
            <div style="display:flex; gap:15px; margin-bottom:15px; align-items:center;">
                <img src="${item.img}" style="width:60px; height:60px; border-radius:10px;">
                <div style="flex:1">
                    <h4 style="font-size:14px">${item.name}</h4>
                    <p style="font-size:11px; color:#666">${item.variant} - ₹${item.price}</p>
                </div>
                <i class="fa-solid fa-trash" style="color:#ff4d4d; cursor:pointer" onclick="removeItem(${index})"></i>
            </div>
        `;
    }).join('');
    document.getElementById('cart-total').innerText = '₹' + total;
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// 6. Floating Popup Logic
function showPopup(name, price) {
    const pop = document.getElementById('cart-popup');
    document.getElementById('pop-item-name').innerText = name;
    
    let currentTotal = cart.reduce((s, i) => s + parseInt(i.price), 0);
    document.getElementById('pop-total').innerText = `Total: ₹${currentTotal}`;

    pop.classList.add('show');
    setTimeout(() => pop.classList.remove('show'), 4000);
}

function hidePopup() {
    document.getElementById('cart-popup').classList.remove('show');
}

loadProducts();