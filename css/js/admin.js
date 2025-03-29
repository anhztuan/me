// DOM Elements
const tabItems = document.querySelectorAll('.tab-item');
const tabPanes = document.querySelectorAll('.tab-pane');
const adminEndpointsTableBody = document.getElementById('admin-endpoints-table-body');
const adminEndpointsLoading = document.getElementById('admin-endpoints-loading');
const adminEndpointsTableContainer = document.getElementById('admin-endpoints-table-container');
const adminAddEndpointBtn = document.getElementById('admin-add-endpoint-btn');
const adminEndpointModal = document.getElementById('admin-endpoint-modal');
const adminCloseModalBtn = document.querySelector('#admin-endpoint-modal .close-modal');
const adminCancelEndpointBtn = document.getElementById('admin-cancel-endpoint');
const adminEndpointForm = document.getElementById('admin-endpoint-form');
const adminNotification = document.getElementById('admin-notification');
const adminNotificationMessage = document.getElementById('admin-notification-message');
const adminNotificationCloseBtn = document.querySelector('#admin-notification .notification-close');
const websiteInfoForm = document.getElementById('website-info-form');
const websiteNameInput = document.getElementById('website-name');
const websiteDescriptionInput = document.getElementById('website-description');
const websiteVersionInput = document.getElementById('website-version');
const adminWebsiteName = document.getElementById('admin-website-name');
const endpointsDocsAccordion = document.getElementById('endpoints-docs-accordion');
const saveSystemSettingsBtn = document.getElementById('save-system-settings');
const docEditModal = document.getElementById('doc-edit-modal');
const docEditForm = document.getElementById('doc-edit-form');
const docCloseModalBtn = document.querySelector('#doc-edit-modal .close-modal');
const cancelDocEditBtn = document.getElementById('cancel-doc-edit');
const endpointModalTitle = document.getElementById('endpoint-modal-title');
const endpointIdInput = document.getElementById('endpoint-id');

// Data
let endpoints = [];
let websiteInfo = {
    name: 'API Endpoint Manager',
    description: 'Manage your API endpoints easily',
    version: '1.0.0'
};
let editingEndpointId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
});

// Load Data
function loadData() {
    // Load website info from localStorage
    const storedInfo = localStorage.getItem('websiteInfo');
    if (storedInfo) {
        websiteInfo = JSON.parse(storedInfo);
        updateWebsiteInfoForm();
    }
    
    // Simulate loading endpoints
    setTimeout(() => {
        // Check if endpoints exist in localStorage
        const storedEndpoints = localStorage.getItem('endpoints');
        if (storedEndpoints) {
            endpoints = JSON.parse(storedEndpoints);
        } else {
            // Sample data if none exists
            endpoints = [
                { id: 1, name: 'Get Users', method: 'GET', url: '/api/users', status: 'active', description: 'Retrieve all users' },
                { id: 2, name: 'Create User', method: 'POST', url: '/api/users', status: 'active', description: 'Create a new user' },
                { id: 3, name: 'Update User', method: 'PUT', url: '/api/users/:id', status: 'active', description: 'Update an existing user' },
                { id: 4, name: 'Delete User', method: 'DELETE', url: '/api/users/:id', status: 'inactive', description: 'Delete a user' },
                { id: 5, name: 'Get Products', method: 'GET', url: '/api/products', status: 'active', description: 'Retrieve all products' },
            ];
            saveEndpoints();
        }
        
        renderEndpoints();
        renderEndpointDocs();
        adminEndpointsLoading.style.display = 'none';
        adminEndpointsTableContainer.style.display = 'block';
    }, 1000);
}

// Setup Event Listeners
function setupEventListeners() {
    // Tab switching
    tabItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            
            // Update active tab
            tabItems.forEach(tab => tab.classList.remove('active'));
            item.classList.add('active');
            
            // Show active tab content
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Modal events
    adminAddEndpointBtn.addEventListener('click', () => {
        resetEndpointForm();
        endpointModalTitle.textContent = 'Add New Endpoint';
        adminEndpointModal.style.display = 'block';
    });
    
    adminCloseModalBtn.addEventListener('click', () => {
        adminEndpointModal.style.display = 'none';
    });
    
    adminCancelEndpointBtn.addEventListener('click', () => {
        adminEndpointModal.style.display = 'none';
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === adminEndpointModal) {
            adminEndpointModal.style.display = 'none';
        }
        if (e.target === docEditModal) {
            docEditModal.style.display = 'none';
        }
    });
    
    // Endpoint form submission
    adminEndpointForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(adminEndpointForm);
        const endpointData = {
            name: formData.get('name'),
            method: formData.get('method'),
            url: formData.get('url'),
            status: formData.get('status'),
            description: formData.get('description')
        };
        
        if (editingEndpointId) {
            // Update existing endpoint
            const index = endpoints.findIndex(e => e.id === editingEndpointId);
            if (index !== -1) {
                endpointData.id = editingEndpointId;
                endpoints[index] = endpointData;
                showNotification(`Endpoint "${endpointData.name}" has been updated.`, 'success');
            }
        } else {
            // Add new endpoint
            endpointData.id = endpoints.length > 0 ? Math.max(...endpoints.map(e => e.id)) + 1 : 1;
            endpoints.push(endpointData);
            showNotification(`Endpoint "${endpointData.name}" has been added.`, 'success');
        }
        
        saveEndpoints();
        renderEndpoints();
        renderEndpointDocs();
        
        adminEndpointModal.style.display = 'none';
        editingEndpointId = null;
    });
    
    // Website info form submission
    websiteInfoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        websiteInfo = {
            name: websiteNameInput.value,
            description: websiteDescriptionInput.value,
            version: websiteVersionInput.value
        };
        
        saveWebsiteInfo();
        showNotification('Website information has been updated.', 'success');
    });
    
    // System settings save
    saveSystemSettingsBtn.addEventListener('click', () => {
        showNotification('System settings have been saved.', 'success');
    });
    
    // Documentation edit form
    docEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(docEditForm);
        const id = parseInt(formData.get('id'));
        const description = formData.get('description');
        
        const endpoint = endpoints.find(e => e.id === id);
        if (endpoint) {
            endpoint.description = description;
            saveEndpoints();
            renderEndpointDocs();
            showNotification('Documentation has been updated.', 'success');
        }
        
        docEditModal.style.display = 'none';
    });
    
    docCloseModalBtn.addEventListener('click', () => {
        docEditModal.style.display = 'none';
    });
    
    cancelDocEditBtn.addEventListener('click', () => {
        docEditModal.style.display = 'none';
    });
    
    // Notification close
    adminNotificationCloseBtn.addEventListener('click', () => {
        adminNotification.style.display = 'none';
    });
}

// Render Endpoints
function renderEndpoints() {
    adminEndpointsTableBody.innerHTML = '';
    
    endpoints.forEach(endpoint => {
        const row = document.createElement('tr');
        
        // Method badge class
        let methodClass = '';
        switch (endpoint.method) {
            case 'GET':
                methodClass = 'badge-success';
                break;
            case 'POST':
                methodClass = 'badge-primary';
                break;
            case 'PUT':
                methodClass = 'badge-warning';
                break;
            case 'DELETE':
                methodClass = 'badge-danger';
                break;
            default:
                methodClass = 'badge-info';
        }
        
        row.innerHTML = `
            <td>${endpoint.id}</td>
            <td>${endpoint.name}</td>
            <td><span class="badge ${methodClass}">${endpoint.method}</span></td>
            <td>${endpoint.url}</td>
            <td>
                <label class="switch">
                    <input type="checkbox" class="status-toggle" data-id="${endpoint.id}" ${endpoint.status === 'active' ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </td>
            <td>
                <button class="btn btn-primary btn-sm edit-endpoint" data-id="${endpoint.id}">Edit</button>
                <button class="btn btn-danger btn-sm delete-endpoint" data-id="${endpoint.id}">Delete</button>
            </td>
        `;
        
        adminEndpointsTableBody.appendChild(row);
    });
    
    // Add event listeners to status toggles
    document.querySelectorAll('.status-toggle').forEach(toggle => {
        toggle.addEventListener('change', () => {
            const id = parseInt(toggle.getAttribute('data-id'));
            toggleEndpointStatus(id);
        });
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-endpoint').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            editEndpoint(id);
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-endpoint').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            deleteEndpoint(id);
        });
    });
}

// Render Endpoint Documentation
function renderEndpointDocs() {
    endpointsDocsAccordion.innerHTML = '';
    
    endpoints.forEach(endpoint => {
        // Method badge class
        let methodClass = '';
        switch (endpoint.method) {
            case 'GET':
                methodClass = 'badge-success';
                break;
            case 'POST':
                methodClass = 'badge-primary';
                break;
            case 'PUT':
                methodClass = 'badge-warning';
                break;
            case 'DELETE':
                methodClass = 'badge-danger';
                break;
            default:
                methodClass = 'badge-info';
        }
        
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        
        accordionItem.innerHTML = `
            <div class="accordion-header" data-id="${endpoint.id}">
                <div>
                    <span class="badge ${methodClass}">${endpoint.method}</span>
                    ${endpoint.name} - ${endpoint.url}
                </div>
                <span>▼</span>
            </div>
            <div class="accordion-content" id="accordion-content-${endpoint.id}">
                <div class="form-group">
                    <label>Description</label>
                    <p>${endpoint.description || 'No description available.'}</p>
                </div>
                
                <div class="form-group">
                    <label>Example Request</label>
                    <div class="code-block">${getExampleCode(endpoint)}</div>
                </div>
                
                <button class="btn btn-primary edit-doc-btn" data-id="${endpoint.id}">Edit Documentation</button>
            </div>
        `;
        
        endpointsDocsAccordion.appendChild(accordionItem);
    });
    
    // Add event listeners to accordion headers
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const id = header.getAttribute('data-id');
            const content = document.getElementById(`accordion-content-${id}`);
            
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                header.querySelector('span:last-child').textContent = '▼';
            } else {
                content.classList.add('active');
                header.querySelector('span:last-child').textContent = '▲';
            }
        });
    });
    
    // Add event listeners to edit documentation buttons
    document.querySelectorAll('.edit-doc-btn').forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.getAttribute('data-id'));
            editDocumentation(id);
        });
    });
}

// Get Example Code
function getExampleCode(endpoint) {
    if (endpoint.method === 'GET') {
        return `fetch('${endpoint.url}')
  .then(response => response.json())
  .then(data => console.log(data));`;
    } else {
        return `fetch('${endpoint.url}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    // request data here
  })
})
  .then(response => response.json())
  .then(data => console.log(data));`;
    }
}

// Toggle Endpoint Status
function toggleEndpointStatus(id) {
    const endpoint = endpoints.find(e => e.id === id);
    if (endpoint) {
        endpoint.status = endpoint.status === 'active' ? 'inactive' : 'active';
        saveEndpoints();
        
        const statusText = endpoint.status === 'active' ? 'activated' : 'deactivated';
        showNotification(`Endpoint "${endpoint.name}" has been ${statusText}.`, endpoint.status === 'active' ? 'success' : 'warning');
    }
}

// Edit Endpoint
function editEndpoint(id) {
    const endpoint = endpoints.find(e => e.id === id);
    if (endpoint) {
        editingEndpointId = id;
        endpointIdInput.value = endpoint.id;
        document.getElementById('admin-endpoint-name').value = endpoint.name;
        document.getElementById('admin-endpoint-method').value = endpoint.method;
        document.getElementById('admin-endpoint-url').value = endpoint.url;
        document.getElementById('admin-endpoint-status').value = endpoint.status;
        document.getElementById('admin-endpoint-description').value = endpoint.description || '';
        
        endpointModalTitle.textContent = 'Edit Endpoint';
        adminEndpointModal.style.display = 'block';
    }
}

// Reset Endpoint Form
function resetEndpointForm() {
    adminEndpointForm.reset();
    editingEndpointId = null;
    endpointIdInput.value = '';
}

// Delete Endpoint
function deleteEndpoint(id) {
    const endpoint = endpoints.find(e => e.id === id);
    if (endpoint) {
        const name = endpoint.name;
        endpoints = endpoints.filter(e => e.id !== id);
        saveEndpoints();
        renderEndpoints();
        renderEndpointDocs();
        
        showNotification(`Endpoint "${name}" has been deleted.`, 'error');
    }
}

// Edit Documentation
function editDocumentation(id) {
    const endpoint = endpoints.find(e => e.id === id);
    if (endpoint) {
        document.getElementById('doc-endpoint-id').value = endpoint.id;
        document.getElementById('doc-description').value = endpoint.description || '';
        
        docEditModal.style.display = 'block';
    }
}

// Save Endpoints to localStorage
function saveEndpoints() {
    localStorage.setItem('endpoints', JSON.stringify(endpoints));
}

// Save Website Info to localStorage
function saveWebsiteInfo() {
    localStorage.setItem('websiteInfo', JSON.stringify(websiteInfo));
    updateAdminWebsiteName();
}

// Update Website Info Form
function updateWebsiteInfoForm() {
    websiteNameInput.value = websiteInfo.name;
    websiteDescriptionInput.value = websiteInfo.description;
    websiteVersionInput.value = websiteInfo.version;
    updateAdminWebsiteName();
}

// Update Admin Website Name
function updateAdminWebsiteName() {
    if (adminWebsiteName) {
        adminWebsiteName.textContent = `Admin Panel - ${websiteInfo.name}`;
    }
}

// Show Notification
function showNotification(message, type) {
    adminNotificationMessage.textContent = message;
    
    // Set notification color based on type
    adminNotification.className = 'notification';
    switch (type) {
        case 'success':
            adminNotification.classList.add('notification-success');
            break;
        case 'error':
            adminNotification.classList.add('notification-error');
            break;
        case 'warning':
            adminNotification.classList.add('notification-warning');
            break;
        default:
            adminNotification.classList.add('notification-info');
    }
    
    adminNotification.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        adminNotification.style.display = 'none';
    }, 3000);
}
