let allProducts = [];
let cart = [];
let currentOrderId = null; // Stores the database Order ID for coupons and payments

// ================= AUTH GUARD =================
async function verifyUser() {
    try {
        const res = await fetch("http://localhost:3000/auth/verify", {
            credentials: "include"
        });

        if (!res.ok) {
            window.location.href = "http://localhost:5500/IronGear/Backend/public/login.html";
            return;
        }
    } catch (err) {
        console.log("ERROR WHILE VERIFYING USER", err);
        return;
    }
}

// 1. Fetch Products
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/allproduct', {
            credentials: "include"
        });
        const data = await response.json();
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
                    <button class="v-pill ${i === 0 ? 'active' : ''}" 
                        onclick="updateVariant('${p._id}', '${v.price}', '${v.imageUrl}', this)">
                        ${v.label}
                    </button>
                `).join('')}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                <span style="font-size:22px; font-weight:800; color:var(--primary)">₹<span id="price-${p._id}">${p.variants[0].price}</span></span>
                <div style="display:flex; gap:8px;">
                    <button class="btn-cart-add" onclick="addToCart('${p._id}', '${p.name}')"><i class="fa-solid fa-cart-plus"></i></button>
                    <button class="btn-buy" onclick="buyNowDirect('${p._id}', '${p.name}')">Buy Now</button>
                </div>
            </div>
        </div>
    `).join('');
}
let currentUser = null; // Global variable to store user details

// --- 1. UPDATED AUTH & USER DATA ---
async function verifyUser() {
    try {
        // Step 1: Check if user is logged in
        const res = await fetch("http://localhost:3000/auth/verify", {
            credentials: "include"
        });

        if (!res.ok) {
            window.location.href = "http://localhost:5500/IronGear/Backend/public/login.html";
            return;
        }

        // Step 2: Fetch full details for the profile menu
        const detailRes = await fetch("http://localhost:3000/me", { credentials: "include" });
        const detailData = await detailRes.json();
        
        if (detailRes.ok) {
            currentUser = detailData.user;
            // Update the Navbar Name (Show only first name)
            const firstName = currentUser.username.split(' ')[0];
            document.getElementById('user-display-name').innerText = firstName;
        }
    } catch (err) {
        console.log("ERROR WHILE VERIFYING USER", err);
    }
}

// --- 2. PROFILE UI HANDLERS ---
function toggleProfileMenu() {
    const menu = document.getElementById('profile-dropdown');
    const isHidden = menu.style.display === 'none' || menu.style.display === '';
    menu.style.display = isHidden ? 'block' : 'none';
}

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    const container = document.querySelector('.user-menu-container');
    if (container && !container.contains(e.target)) {
        document.getElementById('profile-dropdown').style.display = 'none';
    }
});

// --- 3. PROFILE MODAL CONTROL ---
function showUserInfo() {
    if (!currentUser) return;

    // Populate the side modal
    document.getElementById('modal-username').innerText = currentUser.username;
    document.getElementById('modal-email').innerText = currentUser.email;
    document.getElementById('modal-role').innerText = currentUser.role;
    
    // Slide the modal in
    document.getElementById('user-modal').style.right = '0';
    document.getElementById('overlay').classList.add('active');
    
    // Hide the small dropdown
    document.getElementById('profile-dropdown').style.display = 'none';
}

function closeUserModal() {
    document.getElementById('user-modal').style.right = '-400px';
    // Only remove overlay if the cart drawer isn't open
    if (!document.getElementById('cart-drawer').classList.contains('open')) {
        document.getElementById('overlay').classList.remove('active');
    }
}

// --- 4. LOGOUT LOGIC ---
async function handleLogout() {
    if (!confirm("Are you sure you want to log out of IRON GEAR?")) return;

    try {
        const res = await fetch("http://localhost:3000/logout", { credentials: "include" });
        if (res.ok) {
            // Clear local states if any
            currentUser = null;
            cart = [];
            // Redirect to login
            window.location.href = "http://localhost:5500/IronGear/Backend/public/login.html";
        } else {
            alert("Logout failed. Please try again.");
        }
    } catch (err) {
        console.error("Logout error:", err);
    }
}

function updateVariant(pid, price, img, btn) {
    document.getElementById(`price-${pid}`).innerText = price;
    if (img && img !== "undefined") document.getElementById(`img-${pid}`).src = img;
    btn.parentElement.querySelectorAll('.v-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// 3. Cart & UI Logic
function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('active');
}

function addToCart(id, name) {
    const price = document.getElementById(`price-${id}`).innerText;
    const img = document.getElementById(`img-${id}`).src;
    const variant = document.getElementById(`card-${id}`).querySelector('.v-pill.active').innerText;

    cart.push({ id, name, price, img, variant });
    currentOrderId = null; // Reset order ID because cart changed
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
    currentOrderId = null; 
    updateCartUI();
}

function buyNowDirect(id, name) {
    addToCart(id, name);
    toggleCart();
}

// ================= PAYMENT INTEGRATION =================

// Step 1: Handle Coupon Application
async function handleCoupon() {
    const codeInput = document.getElementById('coupon-code');
    const statusMsg = document.getElementById('coupon-status');
    const code = codeInput.value.trim();

    if (!code) return;
    if (cart.length === 0) return alert("Add items to bag first");

    try {
        // Create order if not exists
        if (!currentOrderId) {
            await createDatabaseOrder();
        }

        const res = await fetch("http://localhost:3000/applycoupon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: currentOrderId, couponCode: code }),
            credentials: "include"
        });

        const data = await res.json();
        statusMsg.style.display = "block";

        if (res.ok) {
            statusMsg.style.color = "#22c55e";
            statusMsg.innerText = `Coupon Applied! -₹${data.discount}`;
            document.getElementById('cart-total').innerText = '₹' + data.finalAmount;
        } else {
            statusMsg.style.color = "#ef4444";
            statusMsg.innerText = data.message;
        }
    } catch (err) {
        console.error("Coupon error:", err);
    }
}

// Step 2: Helper to Create DB Order
async function createDatabaseOrder() {
    const items = cart.map(item => ({
        productId: item.id,
        variantLabel: item.variant,
        quantity: 1
    }));

    const res = await fetch("http://localhost:3000/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
        credentials: "include"
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create order");
    currentOrderId = data.orderId;
    return data;
}

// Step 3: Main Checkout Trigger
async function initiateCheckout() {
    const btn = document.getElementById('checkout-main-btn');
    if (cart.length === 0) return alert("Bag is empty");

    try {
        btn.disabled = true;
        btn.innerText = "Processing...";
        console.log("Function started")

        // 1. Ensure Order is created in DB
        if (!currentOrderId) {
            await createDatabaseOrder();
        }
        console.log("Function Mid")

        // 2. Get Razorpay Order ID from Backend
        const payRes = await fetch("http://localhost:3000/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: currentOrderId }),
            credentials: "include"
        });
        console.log("Function Mid 2")

        const payData = await payRes.json();
        if (!payRes.ok) throw new Error(payData.message);

        // 3. Open Razorpay Modal
        const options = {
            key: payData.key,
            amount: payData.amount * 100,
            currency: payData.currency,
            name: "IRON GEAR",
            description: "Premium Gym Equipment",
            order_id: payData.razorpayOrderId,
            handler: async function (response) {
                verifyPaymentOnServer(response);
            },
            prefill: { name: "Warrior" },
            theme: { color: "#ff4d4d" }
        };
        console.log("Function Mid 3")

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (err) {
        alert(err.message);
        console.log("Error from initiate checkout")
    } finally {
        btn.disabled = false;
        btn.innerText = "Proceed to Checkout";
    }
}

// Step 4: Verify Payment
async function verifyPaymentOnServer(rzpResponse) {
    try {
        const res = await fetch("http://localhost:3000/verifypayment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rzpResponse),
            credentials: "include"
        });

        const data = await res.json();
        if (res.ok) {
            alert("Order Placed! Stock updated.");
            cart = [];
            currentOrderId = null;
            updateCartUI();
            toggleCart();
        } else {
            alert("Verification Failed: " + data.message);
        }
    } catch (err) {
        console.error("Verify error:", err);
    }
}

// ================= UTILS =================
function searchProducts() {
    const query = document.getElementById('productSearch').value.toLowerCase();
    const filtered = allProducts.filter(p => p.name.toLowerCase().includes(query));
    renderGrid(filtered);
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    event.target.classList.add('active');
    if (cat === 'all') return renderGrid(allProducts);
    const filtered = allProducts.filter(p => p.name.toUpperCase() === cat.toUpperCase());
    renderGrid(filtered);
}

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

(async () => {
    await verifyUser();
    loadProducts();
})();