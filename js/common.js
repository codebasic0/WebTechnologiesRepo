// Common JavaScript Functions

// Validate email format
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validate password strength
function validatePassword(password) {
    return password.length >= 6;
}

// Show message
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    
    const container = document.querySelector('main') || document.body;
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => messageDiv.remove(), 3000);
}

// Toggle element visibility
function toggleElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Store data in localStorage
function storeData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Retrieve data from localStorage
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Remove data from localStorage
function removeData(key) {
    localStorage.removeItem(key);
}

// Clear all data from localStorage
function clearAllData() {
    localStorage.clear();
}

// Get current date formatted
function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Smoothly scroll to element
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add active class to navigation
function setActiveNav(elementId) {
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`nav a[href="#${elementId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Log to console with timestamp
function logEvent(message) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}
