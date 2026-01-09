const workspace = document.getElementById('dynamic-content');
const viewTitle = document.getElementById('view-title');
const viewSubtitle = document.getElementById('view-subtitle');
const headerActions = document.getElementById('header-actions');

// 1. Initial Launchpad (The Home Grid)
function renderHome() {
    viewTitle.innerText = "Command Center";
    viewSubtitle.innerText = "Welcome back, Admin.";
    headerActions.innerHTML = '';
    
    workspace.innerHTML = `
        <div class="zone-container">
            <span class="zone-label">System Access Control</span>
            <div class="command-grid">
                <div class="action-card" onclick="openAction('all-users')">
                    <div class="avatar" style="background:#eef4ff; color:#3b82f6;"><i class="fa-solid fa-users"></i></div>
                    <div class="card-info"><h4>User Directory</h4><p>View All Users</p></div>
                </div>
                <div class="action-card" onclick="openAction('find-user')">
                    <div class="avatar" style="background:#f5f3ff; color:#8b5cf6;"><i class="fa-solid fa-magnifying-glass"></i></div>
                    <div class="card-info"><h4>Identity Search</h4><p>Get User By ID</p></div>
                </div>
            </div>
        </div>
        `;
}

// 2. Logic for Button 1: View All Users
async function openAction(action) {
    if (action === 'all-users') {
        viewTitle.innerText = "User Directory";
        viewSubtitle.innerText = "Managing all registered system accounts";
        headerActions.innerHTML = `<button class="btn-back" onclick="renderHome()">Back to Home</button>`;
        
        workspace.innerHTML = `<div style="padding:20px; text-align:center;">Fetching data from API...</div>`;

        try {
            const response = await fetch('http://localhost:3000/admin/allusers', {
                method: 'GET',
                credentials: 'include' // Sends your checkAuth cookie
            });
            const data = await response.json();

            if (response.ok) {
                workspace.innerHTML = `
                    <div class="user-container">
                        <div class="table-header">
                            <p>Total Records: <strong>${data.count}</strong></p>
                            <input type="text" class="search-box" placeholder="Filter users..." id="uSearch" onkeyup="filterUsers()">
                        </div>
                        <div class="table-wrapper">
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email Address</th>
                                        <th>System Role</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="userTableBody">
                                    ${data.users.map(user => `
                                        <tr>
                                            <td><strong>${user.name}</strong></td>
                                            <td>${user.email}</td>
                                            <td><span class="role-badge">${user.roleRef?.name || 'User'}</span></td>
                                            <td><button style="color:var(--primary); background:none; border:none; cursor:pointer;"><i class="fa-solid fa-ellipsis-vertical"></i></button></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            } else {
                workspace.innerHTML = `<div style="color:red; padding:20px;">Error: ${data.message}</div>`;
            }
        } catch (err) {
            workspace.innerHTML = `<div style="color:red; padding:20px;">Server connection failed.</div>`;
        }
    }
}

// Client-side search logic
function filterUsers() {
    const val = document.getElementById('uSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#userTableBody tr');
    rows.forEach(r => r.style.display = r.innerText.toLowerCase().includes(val) ? '' : 'none');
}

// Kick off
renderHome();