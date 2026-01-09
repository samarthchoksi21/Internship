const workspace = document.getElementById('dynamic-content');
const viewTitle = document.getElementById('view-title');
const viewSubtitle = document.getElementById('view-subtitle');
const headerActions = document.getElementById('header-actions');

// Initial Data Load
document.getElementById('admin-name').innerText = localStorage.getItem('userName') || 'Admin Account';

// 1. Function to Render the Main Launchpad
function renderHome() {
    viewTitle.innerText = "Command Center";
    viewSubtitle.innerText = "System Overview & Quick Actions";
    headerActions.innerHTML = '';
    
    workspace.innerHTML = `
        <div class="zone-container">
            <span class="zone-label">User Operations</span>
            <div class="command-grid">
                <div class="action-card" onclick="openAction('all-users')">
                    <div class="icon-box blue"><i class="fa-solid fa-users"></i></div>
                    <div class="card-text"><h4>User Directory</h4><p>Route: /allusers</p></div>
                </div>
                <div class="action-card" onclick="openAction('find-user')">
                    <div class="icon-box purple"><i class="fa-solid fa-id-badge"></i></div>
                    <div class="card-text"><h4>Identity Lookup</h4><p>Route: /user/:id</p></div>
                </div>
                <div class="action-card" onclick="openAction('create-user')">
                    <div class="icon-box emerald"><i class="fa-solid fa-user-plus"></i></div>
                    <div class="card-text"><h4>Onboard User</h4><p>Route: /createUser</p></div>
                </div>
            </div>
        </div>

        <div class="zone-container">
            <span class="zone-label">Inventory Control</span>
            <div class="command-grid">
                <div class="action-card" onclick="openAction('all-products')">
                    <div class="icon-box amber"><i class="fa-solid fa-box-open"></i></div>
                    <div class="card-text"><h4>All Products</h4><p>Route: /product (GET)</p></div>
                </div>
                <div class="action-card" onclick="openAction('create-product')">
                    <div class="icon-box blue"><i class="fa-solid fa-circle-plus"></i></div>
                    <div class="card-text"><h4>Add Product</h4><p>Route: /product (POST)</p></div>
                </div>
            </div>
        </div>

        <div class="zone-container">
            <span class="zone-label">Classification</span>
            <div class="command-grid">
                <div class="action-card" onclick="openAction('all-categories')">
                    <div class="icon-box purple"><i class="fa-solid fa-tags"></i></div>
                    <div class="card-text"><h4>Category List</h4><p>Route: /getAllcategories</p></div>
                </div>
                <div class="action-card" onclick="openAction('create-category')">
                    <div class="icon-box emerald"><i class="fa-solid fa-folder-plus"></i></div>
                    <div class="card-text"><h4>Add Category</h4><p>Route: /createCategory</p></div>
                </div>
            </div>
        </div>
    `;
}

// 2. Function to Switch View when Card is Clicked
function openAction(action) {
    headerActions.innerHTML = `<button class="btn-back" onclick="renderHome()">Back to Home</button>`;
    viewSubtitle.innerText = `Executing System Action: ${action}`;

    if(action === 'all-users') {
        viewTitle.innerText = "Full User Directory";
        workspace.innerHTML = `
            <div class="action-card" style="cursor:default; width:100%;">
                <p>Establishing connection to <code>GET /allusers</code>...</p>
            </div>
        `;
    }
    // Logic for other routes will follow the same pattern
}

// Start
renderHome();