// PHP Form Handling Simulation (Using JavaScript)

// Initialize data structures
let contactSubmissions = JSON.parse(localStorage.getItem('contactSubmissions')) || [];
let orderSubmissions = JSON.parse(localStorage.getItem('orderSubmissions')) || [];

// Contact Form Handler
function handleContactForm(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const category = document.getElementById('category').value;
    const priority = document.querySelector('input[name="priority"]:checked').value;
    const message = document.getElementById('message').value.trim();
    const subscribe = document.querySelector('input[name="subscribe"]').checked;

    // Server-side validation (PHP-style)
    if (!validateContactForm(name, email, message)) {
        return;
    }

    // Create submission object
    const submission = {
        id: Date.now(),
        name: sanitizeInput(name),
        email: sanitizeInput(email),
        category: category,
        priority: priority,
        message: sanitizeInput(message),
        subscribe: subscribe,
        timestamp: new Date().toLocaleString(),
        ipAddress: '192.168.1.100', // Simulated
        userAgent: navigator.userAgent.substring(0, 50)
    };

    // Store in localStorage (simulating database)
    contactSubmissions.unshift(submission);
    localStorage.setItem('contactSubmissions', JSON.stringify(contactSubmissions));

    // Show success message
    showMessage('contactMessage', `Form submitted successfully! Reference: #${submission.id}`, 'success');

    // Send confirmation email (simulated)
    sendConfirmationEmail(email, name, 'contact');

    // Reset form
    document.getElementById('contactForm').reset();

    // Update display
    displayContactSubmissions();
}

// Order Form Handler
function handleOrderForm(event) {
    event.preventDefault();

    const customerName = document.getElementById('customerName').value.trim();
    const product = document.getElementById('product').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const address = document.getElementById('address').value.trim();
    const paymentMethod = document.getElementById('paymentMethod').value;

    // Server-side validation
    if (!validateOrderForm(customerName, product, quantity, address, paymentMethod)) {
        return;
    }

    // Get product price
    const selectedOption = document.querySelector(`#product option[value="${product}"]`);
    const price = parseFloat(selectedOption.getAttribute('data-price'));
    const total = price * quantity;

    // Create order object
    const order = {
        id: 'ORD-' + Date.now(),
        customerName: sanitizeInput(customerName),
        product: product,
        quantity: quantity,
        price: price,
        totalAmount: total,
        address: sanitizeInput(address),
        paymentMethod: paymentMethod,
        status: 'Pending',
        timestamp: new Date().toLocaleString(),
        ipAddress: '192.168.1.100'
    };

    // Store in localStorage (simulating database)
    orderSubmissions.unshift(order);
    localStorage.setItem('orderSubmissions', JSON.stringify(orderSubmissions));

    // Show success message
    showMessage('orderMessage', `Order placed successfully! Order ID: ${order.id}`, 'success');

    // Send order confirmation email
    sendConfirmationEmail(document.getElementById('email').value || customerName + '@example.com', customerName, 'order', order.id);

    // Reset form
    document.getElementById('orderForm').reset();

    // Update display
    displayOrderSubmissions();
}

// Validation Functions (Server-side style)
function validateContactForm(name, email, message) {
    const messageDiv = document.getElementById('contactMessage');
    messageDiv.classList.remove('success', 'error');
    messageDiv.innerHTML = '';

    if (!name || name.length < 3) {
        showMessage('contactMessage', 'Error: Name must be at least 3 characters', 'error');
        return false;
    }

    if (!email || !isValidEmail(email)) {
        showMessage('contactMessage', 'Error: Invalid email address', 'error');
        return false;
    }

    if (!message || message.length < 10) {
        showMessage('contactMessage', 'Error: Message must be at least 10 characters', 'error');
        return false;
    }

    return true;
}

function validateOrderForm(name, product, quantity, address, payment) {
    const messageDiv = document.getElementById('orderMessage');
    messageDiv.classList.remove('success', 'error');
    messageDiv.innerHTML = '';

    if (!name || name.length < 3) {
        showMessage('orderMessage', 'Error: Invalid customer name', 'error');
        return false;
    }

    if (!product) {
        showMessage('orderMessage', 'Error: Please select a product', 'error');
        return false;
    }

    if (quantity < 1 || quantity > 100) {
        showMessage('orderMessage', 'Error: Quantity must be between 1 and 100', 'error');
        return false;
    }

    if (!address || address.length < 10) {
        showMessage('orderMessage', 'Error: Invalid delivery address', 'error');
        return false;
    }

    if (!payment) {
        showMessage('orderMessage', 'Error: Please select a payment method', 'error');
        return false;
    }

    return true;
}

// Utility Functions
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.classList.add(type);
    element.innerHTML = message;
}

function updatePrice() {
    const product = document.getElementById('product').value;
    const quantity = parseInt(document.getElementById('quantity').value) || 1;

    if (!product) {
        document.getElementById('productPrice').textContent = '0.00';
        document.getElementById('totalPrice').textContent = '0.00';
        return;
    }

    const selectedOption = document.querySelector(`#product option[value="${product}"]`);
    const price = parseFloat(selectedOption.getAttribute('data-price'));
    const total = price * quantity;

    document.getElementById('productPrice').textContent = price.toFixed(2);
    document.getElementById('quantityDisplay').textContent = quantity;
    document.getElementById('totalPrice').textContent = total.toFixed(2);
}

// Send confirmation email (simulated)
function sendConfirmationEmail(email, name, type, orderId = '') {
    const logEntry = {
        to: email,
        subject: type === 'contact' ? 'Contact Form Confirmation' : 'Order Confirmation',
        timestamp: new Date().toLocaleTimeString()
    };
    console.log('Email sent:', logEntry);
}

// Display Submissions
function displayContactSubmissions() {
    const container = document.getElementById('contactList');

    if (contactSubmissions.length === 0) {
        container.innerHTML = '<div class="empty-state">No contact form submissions yet.</div>';
        return;
    }

    container.innerHTML = contactSubmissions.map(submission => `
        <div class="submission-item">
            <div class="submission-header">
                <h4>${submission.name}</h4>
                <span class="submission-time">${submission.timestamp}</span>
            </div>
            <div class="submission-details">
                <div class="submission-field">
                    <label>Email</label>
                    <p>${submission.email}</p>
                </div>
                <div class="submission-field">
                    <label>Category</label>
                    <p>${submission.category}</p>
                </div>
                <div class="submission-field">
                    <label>Priority</label>
                    <p><span class="badge badge-${submission.priority === 'high' ? 'success' : submission.priority === 'medium' ? 'primary' : 'secondary'}">${submission.priority.toUpperCase()}</span></p>
                </div>
                <div class="submission-field">
                    <label>Newsletter</label>
                    <p>${submission.subscribe ? 'Yes' : 'No'}</p>
                </div>
            </div>
            <div class="submission-field" style="grid-column: 1/-1; margin-top: 1rem;">
                <label>Message</label>
                <p>${submission.message}</p>
            </div>
            <button class="delete-btn" style="margin-top: 1rem;" onclick="deleteSubmission('contact', ${submission.id})">Delete</button>
        </div>
    `).join('');
}

function displayOrderSubmissions() {
    const container = document.getElementById('orderList');

    if (orderSubmissions.length === 0) {
        container.innerHTML = '<div class="empty-state">No orders submitted yet.</div>';
        return;
    }

    container.innerHTML = orderSubmissions.map(order => `
        <div class="submission-item">
            <div class="submission-header">
                <h4>${order.id} - ${order.customerName}</h4>
                <span class="submission-time">${order.timestamp}</span>
            </div>
            <div class="submission-details">
                <div class="submission-field">
                    <label>Product</label>
                    <p>${order.product.toUpperCase()}</p>
                </div>
                <div class="submission-field">
                    <label>Quantity</label>
                    <p>${order.quantity}</p>
                </div>
                <div class="submission-field">
                    <label>Unit Price</label>
                    <p>$${order.price.toFixed(2)}</p>
                </div>
                <div class="submission-field">
                    <label>Total Amount</label>
                    <p><strong>$${order.totalAmount.toFixed(2)}</strong></p>
                </div>
                <div class="submission-field">
                    <label>Payment Method</label>
                    <p>${order.paymentMethod}</p>
                </div>
                <div class="submission-field">
                    <label>Status</label>
                    <p><span class="badge badge-primary">${order.status}</span></p>
                </div>
            </div>
            <div class="submission-field" style="grid-column: 1/-1; margin-top: 1rem;">
                <label>Delivery Address</label>
                <p>${order.address}</p>
            </div>
            <button class="delete-btn" style="margin-top: 1rem;" onclick="deleteSubmission('order', ${order.id})">Delete Order</button>
        </div>
    `).join('');
}

function deleteSubmission(type, id) {
    if (confirm('Are you sure you want to delete this submission?')) {
        if (type === 'contact') {
            contactSubmissions = contactSubmissions.filter(s => s.id !== id);
            localStorage.setItem('contactSubmissions', JSON.stringify(contactSubmissions));
            displayContactSubmissions();
        } else {
            orderSubmissions = orderSubmissions.filter(o => o.id !== id);
            localStorage.setItem('orderSubmissions', JSON.stringify(orderSubmissions));
            displayOrderSubmissions();
        }
    }
}

// Tab Switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    displayContactSubmissions();
    displayOrderSubmissions();
});
