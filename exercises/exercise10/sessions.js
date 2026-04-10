// Sessions & Cookies Management

let sessionData = JSON.parse(sessionStorage.getItem('sessionData')) || {};
let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

// Initialize Session
function initSession() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = 'SID-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('sessionStart', new Date().toLocaleString());
    }

    document.getElementById('sessionId').textContent = sessionId;
    document.getElementById('sessionStart').textContent = localStorage.getItem('sessionStart');
    document.getElementById('userAgent').textContent = navigator.userAgent.substring(0, 60) + '...';
    
    updateSessionDuration();
    setInterval(updateSessionDuration, 1000);

    displayCookies();
    displaySessionData();
    displayCart();
}

// Update Session Duration
function updateSessionDuration() {
    const startTime = new Date(localStorage.getItem('sessionStart'));
    const now = new Date();
    const duration = Math.floor((now - startTime) / 1000);
    
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    document.getElementById('sessionDuration').textContent = 
        `${hours}h ${minutes}m ${seconds}s`;
}

// Set Cookie
function setCookie(event) {
    event.preventDefault();
    
    const name = document.getElementById('cookieName').value.trim();
    const value = document.getElementById('cookieValue').value.trim();
    const expiryDays = parseInt(document.getElementById('cookieExpiry').value);
    const path = document.getElementById('cookiePath').value;

    if (!name || !value) {
        alert('Please enter cookie name and value');
        return;
    }

    // Create expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    // Set cookie string
    const cookieString = `${name}=${value}; path=${path}`;
    
    // Store in localStorage for demo (since we're client-side)
    const cookies = JSON.parse(localStorage.getItem('cookies') || '{}');
    cookies[name] = {
        value: value,
        expiryDate: expiryDate.toLocaleString(),
        path: path,
        createdDate: new Date().toLocaleString()
    };
    localStorage.setItem('cookies', JSON.stringify(cookies));

    alert(`✓ Cookie "${name}" set successfully!`);
    event.target.reset();
    displayCookies();
}

// Display Cookies
function displayCookies() {
    const cookies = JSON.parse(localStorage.getItem('cookies') || '{}');
    const cookiesList = document.getElementById('cookiesList');

    if (Object.keys(cookies).length === 0) {
        cookiesList.innerHTML = '<div class="empty-state">No cookies set yet.</div>';
        return;
    }

    cookiesList.innerHTML = Object.entries(cookies).map(([name, data]) => `
        <div class="data-item">
            <div class="data-item-content">
                <div class="data-item-key">${name}</div>
                <div class="data-item-value">${data.value}</div>
                <div class="data-item-meta">
                    Path: ${data.path} | Expires: ${data.expiryDate}
                </div>
            </div>
            <div class="data-item-actions">
                <button class="btn-small btn-delete" onclick="deleteCookie('${name}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Delete Cookie
function deleteCookie(name) {
    const cookies = JSON.parse(localStorage.getItem('cookies') || '{}');
    delete cookies[name];
    localStorage.setItem('cookies', JSON.stringify(cookies));
    displayCookies();
}

// Clear All Cookies
function clearAllCookies() {
    if (confirm('Are you sure you want to delete all cookies?')) {
        localStorage.removeItem('cookies');
        displayCookies();
    }
}

// Add Session Data
function addSessionData(event) {
    event.preventDefault();

    const key = document.getElementById('dataKey').value.trim();
    const value = document.getElementById('dataValue').value.trim();

    if (!key || !value) {
        alert('Please enter both key and value');
        return;
    }

    sessionData[key] = {
        value: value,
        storedAt: new Date().toLocaleTimeString()
    };

    sessionStorage.setItem('sessionData', JSON.stringify(sessionData));

    alert(`✓ Session data stored: ${key} = ${value}`);
    event.target.reset();
    displaySessionData();
}

// Display Session Data
function displaySessionData() {
    const sessionDataList = document.getElementById('sessionDataList');
    const keys = Object.keys(sessionData);

    if (keys.length === 0) {
        sessionDataList.innerHTML = '<div class="empty-state">No session data stored yet.</div>';
        return;
    }

    sessionDataList.innerHTML = keys.map(key => `
        <div class="data-item">
            <div class="data-item-content">
                <div class="data-item-key">${key}</div>
                <div class="data-item-value">${sessionData[key].value}</div>
                <div class="data-item-meta">
                    Stored at: ${sessionData[key].storedAt}
                </div>
            </div>
            <div class="data-item-actions">
                <button class="btn-small btn-delete" onclick="deleteSessionData('${key}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Delete Session Data
function deleteSessionData(key) {
    delete sessionData[key];
    sessionStorage.setItem('sessionData', JSON.stringify(sessionData));
    displaySessionData();
}

// Clear Session Data
function clearSessionData() {
    if (confirm('Are you sure you want to clear all session data?')) {
        sessionData = {};
        sessionStorage.removeItem('sessionData');
        displaySessionData();
    }
}

// Add to Cart
function addToCart(event) {
    event.preventDefault();

    const itemName = document.getElementById('itemName').value.trim();
    const itemPrice = parseFloat(document.getElementById('itemPrice').value);
    const itemQuantity = parseInt(document.getElementById('itemQuantity').value);

    if (!itemName || itemPrice < 0 || itemQuantity < 1) {
        alert('Please enter valid item details');
        return;
    }

    const item = {
        id: Date.now(),
        name: itemName,
        price: itemPrice,
        quantity: itemQuantity,
        addedAt: new Date().toLocaleTimeString()
    };

    cart.push(item);
    sessionStorage.setItem('cart', JSON.stringify(cart));

    alert(`✓ "${itemName}" added to cart!`);
    event.target.reset();
    displayCart();
}

// Display Cart
function displayCart() {
    const cartList = document.getElementById('cartList');

    if (cart.length === 0) {
        cartList.innerHTML = '<div class="empty-message">Your cart is empty.</div>';
        document.getElementById('cartCount').textContent = '0';
        document.getElementById('cartTotal').textContent = '0.00';
        return;
    }

    let totalPrice = 0;
    cartList.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;

        return `
            <div class="data-item">
                <div class="data-item-content">
                    <div class="data-item-key">${item.name}</div>
                    <div class="data-item-value">
                        Price: $${item.price.toFixed(2)} × ${item.quantity} = $${itemTotal.toFixed(2)}
                    </div>
                    <div class="data-item-meta">
                        Added at: ${item.addedAt}
                    </div>
                </div>
                <div class="data-item-actions">
                    <button class="btn-small btn-delete" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('cartCount').textContent = cart.length;
    document.getElementById('cartTotal').textContent = totalPrice.toFixed(2);
}

// Remove from Cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

// Clear Cart
function clearCart() {
    if (confirm('Are you sure you want to empty your cart?')) {
        cart = [];
        sessionStorage.removeItem('cart');
        displayCart();
    }
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Store order in session
    const order = {
        orderId: 'ORD-' + Date.now(),
        items: cart,
        total: total,
        orderDate: new Date().toLocaleString(),
        status: 'Pending'
    };

    sessionStorage.setItem('lastOrder', JSON.stringify(order));

    alert(`✓ Order placed successfully!\nOrder ID: ${order.orderId}\nTotal: $${total.toFixed(2)}`);
    clearCart();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initSession();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    console.log('Session ending...');
    // In a real PHP app, this would trigger session destroy
});

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - session may be preserved');
    } else {
        console.log('Page visible - session active');
    }
});
