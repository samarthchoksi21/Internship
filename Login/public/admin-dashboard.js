// --- SECURITY GATE ---
(function() {
    if (localStorage.getItem('role')?.toLowerCase() !== 'admin') window.location.href = "http://localhost:5500/Login/public/login.html";
})();

const workspace = document.getElementById('dynamic-content');
const viewTitle = document.getElementById('view-title');
const viewSubtitle = document.getElementById('view-subtitle');
const headerActions = document.getElementById('header-actions');

// --- 1. HOME ---
function renderHome() {
    viewTitle.innerText = "Command Center";
    viewSubtitle.innerText = "IRON-GEAR Administration Overview";
    headerActions.innerHTML = '';
    workspace.innerHTML = `
        <div class="command-grid animate-in">
            <div class="action-card" onclick="fetchAllUsers()">
                <div class="icon-box blue"><i class="fa-solid fa-users"></i></div>
                <div class="card-text"><h4>User Directory</h4><p>List, Edit & Delete</p></div>
            </div>
            <div class="action-card" onclick="renderSearchPage()">
                <div class="icon-box purple"><i class="fa-solid fa-id-card"></i></div>
                <div class="card-text"><h4>Identity Search</h4><p>Find User by ID</p></div>
            </div>
            <div class="action-card" onclick="renderCreateForm()">
                <div class="icon-box green"><i class="fa-solid fa-user-plus"></i></div>
                <div class="card-text"><h4>Create User</h4><p>Manual Registration</p></div>
            </div>
        </div>
    `;
}

// --- 2. GET ALL USERS ---
async function fetchAllUsers() {
    viewTitle.innerText = "User Directory";
    headerActions.innerHTML = `<button class="btn-back" onclick="renderHome()">Back</button>`;
    try {
        const res = await fetch('http://localhost:3000/admin/allusers', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) {
            workspace.innerHTML = `
                <div class="table-wrapper animate-in">
                    <table class="admin-table">
                        <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
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
    } catch (e) { workspace.innerHTML = "Server Error."; }
}

// --- 3. UPDATE USER & CHANGE ROLE ---
function renderUpdatePage(id, name, email) {
    viewTitle.innerText = `Updating: ${name}`;
    headerActions.innerHTML = `<button class="btn-back" onclick="fetchAllUsers()">Back</button>`;
    workspace.innerHTML = `
        <div class="update-grid animate-in">
            <div class="form-container">
                <h3>Update Profile</h3>
                <form id="upForm">
                    <div class="form-group"><label>Username</label><input type="text" id="upU" value="${name}"></div>
                    <div class="form-group"><label>Email</label><input type="email" id="upE" value="${email}"></div>
                    <div class="form-group"><label>New Password</label><input type="password" id="upP" placeholder="Min 6 chars"></div>
                    <button type="submit" class="btn-primary-action">Update Details</button>
                </form>
            </div>
            <div class="form-container">
                <h3>Role Management</h3>
                <div class="form-group">
                    <label>Select Role</label>
                    <select id="roleSel">
                        <option value="USER">USER</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>
                <button onclick="changeRole('${id}')" class="btn-primary-action" style="background:var(--navy)">Apply Role Change</button>
            </div>
        </div>`;

    document.getElementById('upForm').onsubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:3000/admin/updateuser/${id}`, {
                method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include',
                body: JSON.stringify({username:upU.value, email:upE.value, password:upP.value})
            });
            const data = await res.json(); alert(data.message);
        } catch (e) { alert("Update failed."); }
    };
}

async function changeRole(id) {
    const roleName = document.getElementById('roleSel').value;
    try {
        const res = await fetch(`http://localhost:3000/admin/changerole/${id}`, {
            method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include',
            body: JSON.stringify({ roleName })
        });
        const data = await res.json(); alert(data.message);
        if(res.ok) fetchAllUsers();
    } catch (e) { alert("Failed."); }
}

// --- 4. CREATE USER ---
function renderCreateForm() {
    viewTitle.innerText = "Register New User";
    headerActions.innerHTML = `<button class="btn-back" onclick="renderHome()">Back</button>`;
    workspace.innerHTML = `<div class="form-container animate-in">
        <form id="cForm">
            <div class="form-group"><label>Username</label><input type="text" id="cN" required></div>
            <div class="form-group"><label>Email</label><input type="email" id="cE" required></div>
            <div class="form-group"><label>Password</label><input type="password" id="cP" required></div>
            <button type="submit" class="btn-primary-action">Create Account</button>
        </form>
    </div>`;
    document.getElementById('cForm').onsubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:3000/admin/createUser', {
            method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include',
            body: JSON.stringify({username:cN.value, email:cE.value, password:cP.value})
        });
        const data = await res.json(); alert(data.message);
        if(res.ok) fetchAllUsers();
    };
}

// --- 5. DELETE USER ---
async function deleteUser(id, name) {
    if (!confirm(`Permanently delete ${name}?`)) return;
    try {
        const res = await fetch(`http://localhost:3000/admin/user/${id}`, { method: 'DELETE', credentials: 'include' });
        const data = await res.json(); alert(data.message);
        if (res.ok) fetchAllUsers();
    } catch (e) { alert("Delete failed. Check CORS."); }
}

// --- 6. IDENTITY SEARCH ---
function renderSearchPage() {
    viewTitle.innerText = "Identity Lookup";
    headerActions.innerHTML = `<button class="btn-back" onclick="renderHome()">Back</button>`;
    workspace.innerHTML = `<div class="form-container animate-in">
        <div class="form-group"><label>Database ID</label><input type="text" id="sId"></div>
        <button onclick="searchUser()" class="btn-primary-action">Find User</button>
        <div id="sResult" style="margin-top:20px;"></div>
    </div>`;
}

async function searchUser() {
    try {
        const res = await fetch(`http://localhost:3000/admin/user/${sId.value.trim()}`, { credentials: 'include' });
        const data = await res.json();
        sResult.innerHTML = res.ok ? `<div class="form-container"><h3>${data.user.username}</h3><p>${data.user.email}</p></div>` : `<p>${data.message}</p>`;
    } catch (e) { alert("Search failed."); }
}

function logout() { localStorage.clear(); window.location.href = 'login.html'; }
document.getElementById('admin-name').innerText = localStorage.getItem('userName') || 'Admin';
renderHome();