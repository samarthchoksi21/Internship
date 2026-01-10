// --- 1. SECURITY & INITIALIZATION ---
(function() {
    // Basic role check to prevent unauthorized access
    if (localStorage.getItem('role')?.toLowerCase() !== 'admin') {
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
    viewSubtitle.innerText = "Unified control for Iron-Gear users and shop inventory.";
    headerActions.innerHTML = ''; // No back button on home
    
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
        </div>
    `;
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

// --- 6. UTILITIES ---
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Set admin name in sidebar
document.getElementById('admin-name').innerText = localStorage.getItem('userName') || 'Admin';

// Initialize Dashboard
renderHome();