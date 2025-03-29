// DOM Elements
const tabItems = document.querySelectorAll('.tab-item');
const tabPanes = document.querySelectorAll('.tab-pane');
const endpointsTableBody = document.getElementById('endpoints-table-body');
const endpointsLoading = document.getElementById('endpoints-loading');
const endpointsTableContainer = document.getElementById('endpoints-table-container');
const addEndpointBtn = document.getElementById('add-endpoint-btn');
const endpointModal = document.getElementById('endpoint-modal');
const closeModalBtn = document.querySelector('#endpoint-modal .close-modal');
const cancelEndpointBtn = document.getElementById('cancel-endpoint');
const endpointForm = document.getElementById('endpoint-form');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const notificationCloseBtn = document.querySelector('.notification-close');
const websiteNameElement = document.getElementById('website-name');
const websiteDescriptionElement = document.getElementById('website-description');
const infoNameElement = document.getElementById('info-name');
const infoDescriptionElement = document.getElementById('info-description');
const infoVersionElement = document.getElementById('info-version');

// Data
let endpoints = [];
let websiteInfo = {
    name: 'API Endpoint Manager',
    description: 'Manage your API endpoints easily',
    version: '1.0.0'
};

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
        updateWebsiteInfoDisplay();
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
                { id: 1, name: 'Get Users', method: 'GET', url: '/api/users', status: 'active' },
                { id: 2, name: 'Create User', method: 'POST', url: '/api/users', status: 'active' },
                { id: 3, name: 'Update User', method: 'PUT', url: '/api/users/:id', status: 'active' },
                { id: 4, name: 'Delete User', method: 'DELETE', url: '/api/users/:id', status: 'inactive' },
                { id: 5, name: 'Get Products', method: 'GET', url: '/api/products', status: 'active' },
            ];
            saveEndpoints();
        }
        
        renderEndpoints();
        endpointsLoading.style.display = 'none';
        endpointsTableContainer.style.display = 'block';
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
    addEndpointBtn.addEventListener('click', () => {
        endpointForm.reset();
        endpointModal.style.display = 'block';
    });
    
    closeModalBtn.addEventListener('click', () => {
        endpointModal.style.display = 'none';
    });
    
    cancelEndpointBtn.addEventListener('click', () => {
        endpointModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === endpointModal) {
            endpointModal.style.display = 'none';
        }
    });
    
    // Form submission
    endpointForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(endpointForm);
        const newEndpoint = {
            id: endpoints.length > 0 ? Math.max(...endpoints.map(e => e.id)) + 1 : 1,
            name: formData.get('name'),
            method: formData.get('method'),
            url: formData.get('url'),
            status: formData.get('status')
        };
        
        endpoints.push(newEndpoint);
        saveEndpoints();
        renderEndpoints();
        
        endpointModal.style.display = 'none';
        showNotification(`Endpoint "${newEndpoint.name}" has been added successfully.`, 'success');
    });
    
    // Notification close
    notificationCloseBtn.addEventListener('click', () => {
        notification.style.display = 'none';
    });
}

// Render Endpoints
function renderEndpoints() {
    endpointsTableBody.innerHTML = '';
    
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
        
        // Status badge class
        const statusClass = endpoint.status === 'active' ? 'badge-success' : 'badge-danger';
        
        row.innerHTML = `
            <td>${endpoint.name}</td>
            <td><span class="badge ${methodClass}">${endpoint.method}</span></td>
            <td>${endpoint.url}</td>
            <td><span class="badge ${statusClass}" data-id="${endpoint.id}">${endpoint.status}</span></td>
            <td>
                <button class="btn btn-danger btn-sm delete-endpoint" data-id="${endpoint.id}">Delete</button>
            </td>
        `;
        
        endpointsTableBody.appendChild(row);
    });
    
    // Add event listeners to status badges
    document.querySelectorAll('.badge[data-id]').forEach(badge => {
        badge.addEventListener('click', () => {
            const id = parseInt(badge.getAttribute('data-id'));
            toggleEndpointStatus(id);
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

// Toggle Endpoint Status
function toggleEndpointStatus(id) {
    const endpoint = endpoints.find(e => e.id === id);
    if (endpoint) {
        endpoint.status = endpoint.status === 'active' ? 'inactive' : 'active';
        saveEndpoints();
        renderEndpoints();
        
        const statusText = endpoint.status === 'active' ? 'activated' : 'deactivated';
        showNotification(`Endpoint "${endpoint.name}" has been ${statusText}.`, endpoint.status === 'active' ? 'success' : 'warning');
    }
}

// Delete Endpoint
function deleteEndpoint(id) {
    const endpoint = endpoints.find(e => e.id === id);
    if (endpoint) {
        const name = endpoint.name;
        endpoints = endpoints.filter(e => e.id !== id);
        saveEndpoints();
        renderEndpoints();
        
        showNotification(`Endpoint "${name}" has been deleted.`, 'error');
    }
}

// Save Endpoints to localStorage
function saveEndpoints() {
    localStorage.setItem('endpoints', JSON.stringify(endpoints));
}

// Update Website Info Display
function updateWebsiteInfoDisplay() {
    websiteNameElement.textContent = websiteInfo.name;
    websiteDescriptionElement.textContent = websiteInfo.description;
    infoNameElement.textContent = `Name: ${websiteInfo.name}`;
    infoDescriptionElement.textContent = `Description: ${websiteInfo.description}`;
    infoVersionElement.textContent = `Version: ${websiteInfo.version}`;
}

// Show Notification
function showNotification(message, type) {
    notificationMessage.textContent = message;
    
    // Set notification color based on type
    notification.className = 'notification';
    switch (type) {
        case 'success':
            notification.classList.add('notification-success');
            break;
        case 'error':
            notification.classList.add('notification-error');
            break;
        case 'warning':
            notification.classList.add('notification-warning');
            break;
        default:
            notification.classList.add('notification-info');
    }
    
    notification.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}
