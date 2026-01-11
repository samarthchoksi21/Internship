// --- 1. SERVER-SIDE SECURITY CHECK ---
(async function() {
    try {
        const res = await fetch("http://localhost:3000/auth/verify", { credentials: 'include' });
        const data = await res.json();

        // 1. Check Authorization
        if (!res.ok || data.user.roleRef.name.toLowerCase() !== 'admin') {
            window.location.href = "login.html";
            return;
        }

        // 2. SUCCESS: Set the Admin Name on the UI from the API data
        const adminNameElement = document.getElementById('admin-name');
        if (adminNameElement) {
            adminNameElement.innerText = data.user.username; 
        }
        
        console.log(`Access Granted: Welcome ${data.user.username}`);

    } catch (err) {
        console.error("Auth Check Failed:", err);
        window.location.href = "login.html";
    }
})();

const workspace = document.getElementById('dynamic-content');
const viewTitle = document.getElementById('view-title');
const viewSubtitle = document.getElementById('view-subtitle');
const headerActions = document.getElementById('header-actions');

// Helper to handle sidebar active states
function setActiveNav(id) {
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(id);
    if (activeBtn) activeBtn.classList.add('active');
}

// --- 2. MAIN DASHBOARD (Unified Hub) ---
function renderHome() {
    setActiveNav('nav-home');
    viewTitle.innerText = "Command Center";
    viewSubtitle.innerText = "Unified control for Iron-Gear users, shop inventory, and products.";
    headerActions.innerHTML = ''; 
    
    workspace.innerHTML = `
        <div class="animate-in">
            <section class="dashboard-section">
                <div class="section-header"><i class="fa-solid fa-user-shield"></i><h3>User Administration</h3></div>
                <div class="command-grid">
                    <div class="action-card" onclick="fetchAllUsers()">
                        <div class="icon-box blue"><i class="fa-solid fa-users"></i></div>
                        <div class="card-text"><h4>User Directory</h4><p>Edit, Delete & Roles</p></div>
                    </div>
                    <div class="action-card" onclick="renderCreateForm()">
                        <div class="icon-box green"><i class="fa-solid fa-user-plus"></i></div>
                        <div class="card-text"><h4>Manual Entry</h4><p>Create New Account</p></div>
                    </div>
                    <div class="action-card" onclick="renderSearchPage()">
                        <div class="icon-box purple"><i class="fa-solid fa-magnifying-glass"></i></div>
                        <div class="card-text"><h4>ID Search</h4><p>Database Identity Check</p></div>
                    </div>
                </div>
            </section>

            <section class="dashboard-section">
                <div class="section-header"><i class="fa-solid fa-layer-group"></i><h3>Category Management</h3></div>
                <div class="command-grid">
                    <div class="action-card" onclick="renderCategoryList()">
                        <div class="icon-box orange"><i class="fa-solid fa-list-ul"></i></div>
                        <div class="card-text"><h4>All Categories</h4><p>View & Remove Depts</p></div>
                    </div>
                    <div class="action-card" onclick="renderAddCategoryForm()">
                        <div class="icon-box green"><i class="fa-solid fa-plus-circle"></i></div>
                        <div class="card-text"><h4>New Category</h4><p>Add Shop Department</p></div>
                    </div>
                    <div class="action-card" onclick="alert('Module Coming Soon: Product Sorting')">
                        <div class="icon-box blue"><i class="fa-solid fa-arrow-down-wide-short"></i></div>
                        <div class="card-text"><h4>Organization</h4><p>Manage Hierarchy</p></div>
                    </div>
                </div>
            </section>

            <section class="dashboard-section">
                <div class="section-header"><i class="fa-solid fa-boxes-stacked"></i><h3>Product Catalog</h3></div>
                <div class="command-grid">
                    <div class="action-card" onclick="fetchProducts()">
                        <div class="icon-box blue"><i class="fa-solid fa-box-open"></i></div>
                        <div class="card-text"><h4>Master Inventory</h4><p>Manage All Products</p></div>
                    </div>
                    <div class="action-card" onclick="renderAddProductForm()">
                        <div class="icon-box green"><i class="fa-solid fa-plus"></i></div>
                        <div class="card-text"><h4>Add Product</h4><p>Create New Listing</p></div>
                    </div>
                    <div class="action-card" onclick="renderStockWatch()">
                        <div class="icon-box orange"><i class="fa-solid fa-triangle-exclamation"></i></div>
                        <div class="card-text"><h4>Stock Watch</h4><p>Low Inventory Tracking</p></div>
                    </div>
                </div>
            </section>
        </div>
    `;
}
async function fetchProducts(page = 1) {
    // Note: You may want to add a nav-products button to your HTML sidebar later
    viewTitle.innerText = "Master Inventory";
    viewSubtitle.innerText = "Manage products, variants, and real-time stock levels.";
    headerActions.innerHTML = `<button class="btn-back" onclick="renderHome()"><i class="fa-solid fa-arrow-left"></i> Back</button>`;
    
    try {
        const res = await fetch(`http://localhost:3000/admin/product?page=${page}&limit=10`, { credentials: 'include' });
        const data = await res.json();
        
        if (res.ok) {
            workspace.innerHTML = `
                <div class="table-wrapper animate-in">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Product Details</th>
                                <th>Category</th>
                                <th>Variants (Price/Stock)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.products.map(p => `
                                <tr>
                                    <td><strong>${p.name}</strong><br><small>${p.slug}</small></td>
                                    <td><span class="role-badge" style="background:#e0f2fe; color:#0369a1;">${p.categoryRef?.name || 'N/A'}</span></td>
                                    <td>
                                        <div style="display:flex; flex-direction:column; gap:4px;">
                                            ${p.variants.map(v => `
                                                <small>• ${v.label}: <strong>$${v.price}</strong> (${v.stock} pcs)</small>
                                            `).join('')}
                                        </div>
                                    </td>
                                    <td>
                                        <button class="btn-edit" onclick="renderEditProduct('${p._id}')"><i class="fa-solid fa-pen"></i></button>
                                        <button class="btn-delete" onclick="deleteProduct('${p._id}', '${p.name}')"><i class="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
                <div style="margin-top:20px; display:flex; gap:10px; justify-content:center;">
                    ${Array.from({length: data.pagination.totalPages}, (_, i) => i + 1).map(pageNum => `
                        <button class="btn-back" style="background:${pageNum === page ? 'var(--primary)' : 'var(--navy)'}" 
                                onclick="fetchProducts(${pageNum})">${pageNum}</button>
                    `).join('')}
                </div>
            `;
        }
    } catch (e) { workspace.innerHTML = "<p>Connection Error to Product API.</p>"; }
}

// --- 3. USER MANAGEMENT LOGIC ---
async function fetchAllUsers() {
    setActiveNav('nav-users');
    viewTitle.innerText = "User Directory";
    viewSubtitle.innerText = "Manage access and permissions for all registered accounts.";
    headerActions.innerHTML = `<button class="btn-back" onclick="renderHome()"><i class="fa-solid fa-arrow-left"></i> Back</button>`;
    
    try {
        const res = await fetch('http://localhost:3000/admin/allusers', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) {
            workspace.innerHTML = `
                <div class="table-wrapper animate-in">
                    <table class="admin-table">
                        <thead><tr><th>User Info</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                        <tbody>
                            ${data.users.map(u => `
                                <tr>
                                    <td><strong>${u.username}</strong></td>
                                    <td>${u.email}</td>
                                    <td><span class="role-badge">${u.roleRef?.name || 'User'}</span></td>
                                    <td>
                                        <button class="btn-edit" onclick="renderUpdatePage('${u._id}', '${u.username}', '${u.email}')"><i class="fa-solid fa-pen"></i></button>
                                        <button class="btn-delete" onclick="deleteUser('${u._id}', '${u.username}')"><i class="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`;
        }
    } catch (e) { workspace.innerHTML = "<p>Connection Error.</p>"; }
}

async function deleteUser(id, name) {
    if (!confirm(`Permanently delete user ${name}?`)) return;
    const res = await fetch(`http://localhost:3000/admin/user/${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    alert(data.message);
    if (res.ok) fetchAllUsers();
}

function renderUpdatePage(id, name, email) {
    viewTitle.innerText = `Edit Profile`;
    headerActions.innerHTML = `<button class="btn-back" onclick="fetchAllUsers()"><i class="fa-solid fa-arrow-left"></i> Back</button>`;
    workspace.innerHTML = `
        <div class="update-grid animate-in">
            <div class="form-container">
                <h3>Credentials</h3>
                <form id="updateForm">
                    <div class="form-group"><label>Username</label><input type="text" id="upN" value="${name}"></div>
                    <div class="form-group"><label>Email</label><input type="email" id="upE" value="${email}"></div>
                    <div class="form-group"><label>New Password</label><input type="password" id="upP" placeholder="Leave blank to keep current"></div>
                    <button type="submit" class="btn-primary-action">Apply Updates</button>
                </form>
            </div>
            <div class="form-container">
                <h3>Role & Permissions</h3>
                <div class="form-group">
                    <label>Select System Role</label>
                    <select id="roleSelect">
                        <option value="USER">USER</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>
                <button onclick="changeRole('${id}')" class="btn-primary-action" style="background:var(--navy)">Update Permissions</button>
            </div>
        </div>`;
    
    document.getElementById('updateForm').onsubmit = async (e) => {
        e.preventDefault();
        const res = await fetch(`http://localhost:3000/admin/updateuser/${id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ username: upN.value, email: upE.value, password: upP.value })
        });
        const d = await res.json(); alert(d.message);
    };
}

async function changeRole(id) {
    const res = await fetch(`http://localhost:3000/admin/changerole/${id}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({ roleName: document.getElementById('roleSelect').value })
    });
    const data = await res.json(); alert(data.message);
    if(res.ok) fetchAllUsers();
}

// --- 4. CATEGORY MANAGEMENT LOGIC ---
async function renderCategoryList() {
    setActiveNav('nav-cats');
    viewTitle.innerText = "Category Directory";
    viewSubtitle.innerText = "View all active departments and their hierarchy.";
    headerActions.innerHTML = `
        <button class="btn-primary-action" onclick="renderAddCategoryForm()" style="width:auto; padding: 10px 20px">+ Add New</button> 
        <button class="btn-back" onclick="renderHome()"><i class="fa-solid fa-arrow-left"></i> Back</button>
    `;
    
    try {
        const res = await fetch('http://localhost:3000/admin/getAllcategories', { credentials: 'include' });
        const data = await res.json();
        workspace.innerHTML = `
            <div class="table-wrapper animate-in">
                <table class="admin-table">
                    <thead><tr><th>Dept Name / Slug</th><th>Parent Category</th><th>Actions</th></tr></thead>
                    <tbody>${data.categories.map(c => `
                        <tr>
                            <td><strong>${c.name}</strong><br><small style="color:var(--text-muted)">${c.slug}</small></td>
                            <td><span class="role-badge" style="background:#f1f5f9; color:#475569;">${c.parentRef?.name || 'Main'}</span></td>
                            <td>
                                <button class="btn-delete" onclick="deleteCategory('${c._id}', '${c.name}')">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (e) { workspace.innerHTML = "Error loading category data."; }
}

async function renderAddCategoryForm() {
    viewTitle.innerText = "New Department";
    headerActions.innerHTML = `<button class="btn-back" onclick="renderHome()"><i class="fa-solid fa-arrow-left"></i> Back</button>`;
    
    try {
        const res = await fetch('http://localhost:3000/admin/getAllcategories', { credentials: 'include' });
        const data = await res.json();
        const parentOptions = data.categories.map(c => `<option value="${c._id}">${c.name}</option>`).join('');

        workspace.innerHTML = `
            <div class="form-container animate-in" style="max-width: 600px; margin: auto;">
                <form id="catForm">
                    <div class="form-group"><label>Category Name</label><input type="text" id="cN" placeholder="e.g. Whey Protein" required></div>
                    <div class="form-group"><label>Parent (Optional)</label><select id="cP"><option value="">Root Level (Top Department)</option>${parentOptions}</select></div>
                    <div class="form-group"><label>Description</label><textarea id="cD" rows="4" placeholder="Briefly describe what belongs in this category..."></textarea></div>
                    <button type="submit" class="btn-primary-action">Create Category</button>
                </form>
            </div>`;

        document.getElementById('catForm').onsubmit = async (e) => {
            e.preventDefault();
            const res = await fetch('http://localhost:3000/admin/createCategory', {
                method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include',
                body: JSON.stringify({name:cN.value, description:cD.value, parentId:cP.value || null})
            });
            const d = await res.json(); 
            alert(d.message); 
            if(res.ok) renderCategoryList();
        };
    } catch (e) { alert("Failed to fetch parent options."); }
}

async function deleteCategory(id, name) {
    if(!confirm(`Delete category "${name}"? This may affect items assigned to it.`)) return;
    const res = await fetch(`http://localhost:3000/admin/category/${id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    alert(data.message);
    if(res.ok) renderCategoryList();
}

// --- 5. SEARCH & MISC ---
function renderSearchPage() {
    viewTitle.innerText = "Identity Lookup";
    headerActions.innerHTML = `<button class="btn-back" onclick="renderHome()"><i class="fa-solid fa-arrow-left"></i> Back</button>`;
    workspace.innerHTML = `
        <div class="form-container animate-in" style="max-width:500px; margin:auto;">
            <div class="form-group">
                <label>Database User ID</label>
                <input type="text" id="sId" placeholder="Paste ID here...">
            </div>
            <button onclick="searchU()" class="btn-primary-action">Run Query</button>
            <div id="sR" style="margin-top:20px;"></div>
        </div>`;
}

async function searchU() {
    const res = await fetch(`http://localhost:3000/admin/user/${sId.value}`, { credentials: 'include' });
    const d = await res.json();
    sR.innerHTML = res.ok ? `<div class="role-badge" style="width:100%; text-align:center; padding:15px; font-size:14px;">Found: ${d.user.username} (${d.user.email})</div>` : `<p style="color:red; text-align:center;">${d.message}</p>`;
}

function renderCreateForm() {
    viewTitle.innerText = "Register Account";
    headerActions.innerHTML = `<button class="btn-back" onclick="renderHome()"><i class="fa-solid fa-arrow-left"></i> Back</button>`;
    workspace.innerHTML = `
        <div class="form-container animate-in" style="max-width:500px; margin:auto;">
            <form id="newUF">
                <div class="form-group"><label>Username</label><input type="text" id="nN" required></div>
                <div class="form-group"><label>Email</label><input type="email" id="nE" required></div>
                <div class="form-group"><label>Initial Password</label><input type="password" id="nP" required></div>
                <button type="submit" class="btn-primary-action">Create User</button>
            </form>
        </div>`;
    document.getElementById('newUF').onsubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:3000/admin/createUser', {
            method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include',
            body: JSON.stringify({ username: nN.value, email: nE.value, password: nP.value })
        });
        const d = await res.json(); alert(d.message); if(res.ok) fetchAllUsers();
    };
}
// --- DYNAMIC VARIANT MANAGEMENT (Updated with Image Support) ---
let productVariants = [];

function addVariantToForm() {
    const label = document.getElementById('vLabel').value;
    const price = parseFloat(document.getElementById('vPrice').value);
    const stock = parseInt(document.getElementById('vStock').value);
    const sku = document.getElementById('vSku').value;
    const vImg = document.getElementById('vImg').value; // New Image Input

    if (!label || isNaN(price) || isNaN(stock) || !sku) {
        alert("Please fill all variant fields (Image is optional but recommended)");
        return;
    }

    if (productVariants.some(v => v.sku === sku)) {
        alert("Duplicate SKU in current list.");
        return;
    }

    // Push the variant including the image URL
    productVariants.push({ 
        label, 
        price, 
        stock, 
        sku, 
        image: vImg // Your controller/schema expects this
    });
    
    updateVariantListUI();

    // Clear variant inputs
    document.getElementById('vLabel').value = '';
    document.getElementById('vPrice').value = '';
    document.getElementById('vStock').value = '';
    document.getElementById('vSku').value = '';
    document.getElementById('vImg').value = '';
}

function updateVariantListUI() {
    const list = document.getElementById('variantList');
    if (productVariants.length === 0) {
        list.innerHTML = `<p style="color:#94a3b8; text-align:center; padding:20px; border: 2px dashed #e2e8f0; border-radius:12px;">No variants added yet.</p>`;
        return;
    }

    list.innerHTML = productVariants.map((v, index) => `
        <div class="variant-item animate-in">
            <div class="variant-info">
                <img src="${v.image || 'https://via.placeholder.com/50'}" class="variant-img-preview" onerror="this.src='https://via.placeholder.com/50'">
                <div class="variant-details">
                    <h4>${v.label} <span style="color:#94a3b8; font-weight:400;">(${v.sku})</span></h4>
                    <p><strong>$${v.price}</strong> • Stock: ${v.stock} pcs</p>
                </div>
            </div>
            <button type="button" class="btn-remove-variant" onclick="productVariants.splice(${index}, 1); updateVariantListUI();">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `).join('');
}

async function renderAddProductForm() {
    productVariants = []; // Reset local state
    viewTitle.innerText = "New Product Entry";
    viewSubtitle.innerText = "Create a new catalog item with multiple inventory variants.";
    headerActions.innerHTML = `<button class="btn-back" onclick="renderHome()"><i class="fa-solid fa-arrow-left"></i> Back</button>`;

    try {
        const catRes = await fetch('http://localhost:3000/admin/getAllcategories', { credentials: 'include' });
        const catData = await catRes.json();
        const catOptions = catData.categories.map(c => `<option value="${c._id}">${c.name}</option>`).join('');

        workspace.innerHTML = `
            <div class="update-grid animate-in">
                <div class="form-container">
                    <h3>Basic Information</h3>
                    <form id="productForm">
                        <div class="form-group"><label>Product Name</label><input type="text" id="pN" placeholder="e.g. Gold Standard Whey" required></div>
                        <div class="form-group"><label>Category</label><select id="pC" required><option value="">Select Category</option>${catOptions}</select></div>
                        <div class="form-group"><label>Description</label><textarea id="pD" rows="3" placeholder="Product details..."></textarea></div>
                        <div class="form-group"><label>Main Gallery (CSV URLs)</label><input type="text" id="pI" placeholder="url1, url2"></div>
                        <button type="submit" class="btn-primary-action" style="width:100%; margin-top:20px;">Publish Product</button>
                    </form>
                </div>

                <div class="form-container">
                    <h3>Product Variants</h3>
                    <div class="variant-input-card">
                        <div class="variant-grid">
                            <div class="form-group"><label>Label</label><input type="text" id="vLabel" placeholder="e.g. Chocolate"></div>
                            <div class="form-group"><label>SKU</label><input type="text" id="vSku" placeholder="WHEY-CHOC"></div>
                            <div class="form-group"><label>Price ($)</label><input type="number" id="vPrice" step="0.01"></div>
                            <div class="form-group"><label>Stock</label><input type="number" id="vStock"></div>
                            <div class="form-group-full"><label>Variant Image URL</label><input type="text" id="vImg" placeholder="https://link-to-image.com"></div>
                        </div>
                        <button type="button" onclick="addVariantToForm()" class="btn-primary-action" style="background:var(--navy); margin-top:15px; width:100%">+ Add Variant to List</button>
                    </div>
                    <div id="variantList"></div>
                </div>
            </div>`;

        updateVariantListUI();

        document.getElementById('productForm').onsubmit = async (e) => {
            e.preventDefault();
            if (productVariants.length === 0) return alert("Please add at least one variant.");
            
            const payload = {
                name: pN.value, description: pD.value, categoryId: pC.value,
                images: pI.value.split(',').map(s => s.trim()).filter(s => s),
                variants: productVariants
            };

            const res = await fetch('http://localhost:3000/admin/product', {
                method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include',
                body: JSON.stringify(payload)
            });
            const d = await res.json(); alert(d.message); if(res.ok) fetchProducts();
        };
    } catch (e) { alert("Error loading creation form."); }
}
// --- EDIT PRODUCT LOGIC ---
async function renderEditProduct(rawProductId) {
    const productId = rawProductId.replace(/[^0-9a-fA-F]/g, ''); // Clean ID string
    viewTitle.innerText = "Refine Product";
    viewSubtitle.innerText = "Update pricing, stock, and descriptive content.";
    headerActions.innerHTML = `<button class="btn-back" onclick="fetchProducts()"><i class="fa-solid fa-arrow-left"></i> Back</button>`;
    workspace.innerHTML = `<div style="text-align:center; padding:50px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        const [prodRes, catRes] = await Promise.all([
            fetch(`http://localhost:3000/admin/product/${productId}`, { credentials: 'include' }),
            fetch('http://localhost:3000/admin/getAllcategories', { credentials: 'include' })
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();
        const p = prodData.product;

        // Map existing variants into our dynamic builder list
        productVariants = p.variants.map(v => ({ ...v }));

        const catOptions = catData.categories.map(c => 
            `<option value="${c._id}" ${c._id === (p.categoryRef?._id || p.categoryRef) ? 'selected' : ''}>${c.name}</option>`
        ).join('');

        workspace.innerHTML = `
            <div class="update-grid animate-in">
                <div class="form-container">
                    <h3>Basic Information</h3>
                    <form id="editProductForm">
                        <div class="form-group"><label>Product Name</label><input type="text" id="pN" value="${p.name}" required></div>
                        <div class="form-group"><label>Category</label><select id="pC" required>${catOptions}</select></div>
                        <div class="form-group"><label>Description</label><textarea id="pD" rows="4">${p.description || ''}</textarea></div>
                        <div class="form-group"><label>Gallery (CSV URLs)</label><input type="text" id="pI" value="${p.images?.join(', ') || ''}"></div>
                        <button type="submit" class="btn-primary-action" style="width:100%; margin-top:20px;">Save All Changes</button>
                    </form>
                </div>

                <div class="form-container">
                    <h3>Manage Variants</h3>
                    <div class="variant-input-card">
                        <div class="variant-grid">
                            <div class="form-group"><label>Label</label><input type="text" id="vLabel"></div>
                            <div class="form-group"><label>SKU</label><input type="text" id="vSku"></div>
                            <div class="form-group"><label>Price ($)</label><input type="number" id="vPrice" step="0.01"></div>
                            <div class="form-group"><label>Stock</label><input type="number" id="vStock"></div>
                            <div class="form-group-full"><label>Variant Image URL</label><input type="text" id="vImg"></div>
                        </div>
                        <button type="button" onclick="addVariantToForm()" class="btn-primary-action" style="background:var(--navy); margin-top:15px; width:100%">+ Update/Add Variant</button>
                    </div>
                    <div id="variantList"></div>
                </div>
            </div>`;

        updateVariantListUI();

        document.getElementById('editProductForm').onsubmit = async (e) => {
            e.preventDefault();
            const res = await fetch(`http://localhost:3000/admin/product/${productId}`, {
                method: 'POST', headers: {'Content-Type': 'application/json'}, credentials: 'include',
                body: JSON.stringify({
                    name: pN.value, description: pD.value, categoryId: pC.value,
                    images: pI.value.split(',').map(s => s.trim()).filter(s => s),
                    variants: productVariants
                })
            });
            const d = await res.json(); alert(d.message); if(res.ok) fetchProducts();
        };
    } catch (err) { alert("Could not fetch product details."); }
}
async function deleteProduct(productId, productName) {
    // 1. Confirm with the user
    const confirmDelete = confirm(`Are you sure you want to delete "${productName}"?\nThis action cannot be undone.`);
    
    if (!confirmDelete) return;

    try {
        const res = await fetch(`http://localhost:3000/admin/product/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message);
            // 2. Refresh the table to show the product is gone
            fetchProducts(); 
        } else {
            alert(data.message || "Failed to delete product");
        }
    } catch (err) {
        console.error("Delete Error:", err);
        alert("Server connection error.");
    }
}
// --- 6. UTILITIES ---
// --- CUSTOM MODAL LOGIC ---
function logout() {
    const modal = document.getElementById('custom-modal-overlay');
    const confirmBtn = document.getElementById('modal-confirm-btn');

    // Show Modal
    modal.style.display = 'flex';
    
    // Set up the click handler for the confirm button
    confirmBtn.onclick = async () => {
        try {
            const res = await fetch('http://localhost:3000/logout', {
                method: 'GET',
                credentials: 'include'
            });

            if (res.ok) {
                window.location.href = 'http://localhost:5500/Login/public/login.html';
            }
        } catch (error) {
            alert("Logout failed connection.");
        }
    };
}

function closeModal() {
    document.getElementById('custom-modal-overlay').style.display = 'none';
}

// Close modal if user clicks outside the card
window.onclick = function(event) {
    const modal = document.getElementById('custom-modal-overlay');
    if (event.target == modal) {
        closeModal();
    }
}
async function renderStockWatch() {
    viewTitle.innerText = "Stock Watch";
    viewSubtitle.innerText = "Items requiring immediate restock attention.";
    headerActions.innerHTML = `<button class="btn-primary-action" onclick="fetchProducts()"><i class="fa-solid fa-rotate"></i> Refresh Inventory</button>`;
    
    workspace.innerHTML = `<div style="text-align:center; padding:50px;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>`;

    try {
        // We reuse your existing Product List API
        const res = await fetch('http://localhost:3000/admin/product?limit=100', { credentials: 'include' });
        const data = await res.json();
        
        // 1. FILTER: Find variants where stock is less than 10
        const lowStockItems = [];
        data.products.forEach(product => {
            product.variants.forEach(variant => {
                if (variant.stock <= 10) {
                    lowStockItems.push({
                        productId: product._id,
                        name: product.name,
                        variantLabel: variant.label,
                        sku: variant.sku,
                        stock: variant.stock,
                        image: variant.image
                    });
                }
            });
        });

        if (lowStockItems.length === 0) {
            workspace.innerHTML = `
                <div class="form-container" style="text-align:center; padding:40px;">
                    <i class="fa-solid fa-check-circle" style="font-size:48px; color:#10b981; margin-bottom:15px;"></i>
                    <h3>All Stocked Up!</h3>
                    <p>No variants are currently below the low-stock threshold.</p>
                </div>`;
            return;
        }

        // 2. RENDER: Show them in an urgent list
        workspace.innerHTML = `
            <div class="form-container animate-in">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Product / Variant</th>
                            <th>SKU</th>
                            <th>Current Stock</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lowStockItems.map(item => `
                            <tr>
                                <td>
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <img src="${item.image || 'https://via.placeholder.com/40'}" style="width:35px; height:35px; border-radius:5px; object-fit:cover;">
                                        <div>
                                            <div style="font-weight:700;">${item.name}</div>
                                            <small style="color:var(--text-muted)">${item.variantLabel}</small>
                                        </div>
                                    </div>
                                </td>
                                <td><code>${item.sku}</code></td>
                                <td>
                                    <span style="font-weight:800; color:${item.stock === 0 ? '#e11d48' : '#f59e0b'}">
                                        ${item.stock} units
                                    </span>
                                </td>
                                <td>
                                    <span class="role-badge" style="background:${item.stock === 0 ? '#ffe4e6' : '#fef3c7'}; color:${item.stock === 0 ? '#e11d48' : '#b45309'}">
                                        ${item.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn-edit" onclick="renderEditProduct('${item.productId}')">
                                        <i class="fa-solid fa-truck-ramp-box"></i> Restock
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        workspace.innerHTML = `<p>Error loading stock alerts.</p>`;
    }
}
function goToStore() {
    // Redirects the admin back to the main customer website
    window.location.href = "http://localhost:5500/Login/public/WebPage.html";
}
// Set admin name in sidebar
document.getElementById('admin-name').innerText = localStorage.getItem('userName') || 'Admin';

// Initialize Dashboard
renderHome();