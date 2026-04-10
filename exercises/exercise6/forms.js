// Form Validation JavaScript

// Tab Switching
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Validation Functions
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

function validatePhone(phone) {
    const regex = /^[0-9]{10,}$/;
    return regex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function validateFullName(name) {
    return name.trim().length >= 3;
}

// Check if email already exists
function emailExists(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
}

// Login Form Submission
function handleLoginSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const messageDiv = document.getElementById('loginMessage');
    
    // Clear previous messages
    messageDiv.classList.remove('success', 'error');
    messageDiv.innerHTML = '';
    
    // Validate email
    if (!validateEmail(email)) {
        showError('loginEmailError', 'Please enter a valid email address');
        return;
    }
    
    // Validate password
    if (password.length < 6) {
        showError('loginPasswordError', 'Password must be at least 6 characters');
        return;
    }
    
    // Check credentials
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
        // Store logged-in user session
        localStorage.setItem('currentUser', JSON.stringify(user));
        messageDiv.classList.add('success');
        messageDiv.innerHTML = `<strong>✓ Login Successful!</strong> Welcome back, ${user.fullName}!`;
        
        // Clear form
        document.getElementById('loginForm').reset();
        
        // Redirect after 2 seconds
        setTimeout(() => {
            displayUsers();
        }, 1500);
    } else {
        messageDiv.classList.add('error');
        messageDiv.innerHTML = '<strong>✗ Login Failed</strong> Invalid email or password.';
    }
}

// Register Form Submission
function handleRegisterSubmit(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const address = document.getElementById('address').value.trim();
    const country = document.getElementById('country').value;
    const terms = document.getElementById('terms').checked;
    const messageDiv = document.getElementById('registerMessage');
    
    // Clear form errors
    clearErrors();
    messageDiv.classList.remove('success', 'error');
    messageDiv.innerHTML = '';
    
    let isValid = true;
    
    // Validate full name
    if (!validateFullName(fullName)) {
        showError('fullNameError', 'Full name must be at least 3 characters');
        isValid = false;
    }
    
    // Validate email format
    if (!validateEmail(email)) {
        showError('regEmailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Check if email already exists
    if (emailExists(email)) {
        showError('regEmailError', 'This email is already registered');
        isValid = false;
    }
    
    // Validate phone
    if (!validatePhone(phone)) {
        showError('phoneError', 'Phone number must be at least 10 digits');
        isValid = false;
    }
    
    // Validate password strength
    if (!validatePassword(password)) {
        showError('regPasswordError', 'Password must contain uppercase, lowercase, and numbers (min 8 characters)');
        isValid = false;
    }
    
    // Check password match
    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        isValid = false;
    }
    
    // Check address (optional but validate if provided)
    if (address.length > 500) {
        showError('addressError', 'Address must be less than 500 characters');
        isValid = false;
    }
    
    // Validate country
    if (!country) {
        showError('countryError', 'Please select a country');
        isValid = false;
    }
    
    // Check terms
    if (!terms) {
        showError('termsError', 'You must agree to the terms and conditions');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Create user object
    const newUser = {
        id: Date.now(),
        fullName: fullName,
        email: email,
        phone: phone,
        password: password,
        address: address,
        country: country,
        registeredDate: new Date().toLocaleDateString()
    };
    
    // Save to localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Show success message
    messageDiv.classList.add('success');
    messageDiv.innerHTML = '<strong>✓ Registration Successful!</strong> Your account has been created. You can now login.';
    
    // Clear form
    document.getElementById('registerForm').reset();
    
    // Update user list
    setTimeout(() => {
        displayUsers();
        switchTab('login');
    }, 2000);
}

// Show error message
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
    }
}

// Clear all errors
function clearErrors() {
    document.querySelectorAll('.error').forEach(el => {
        el.textContent = '';
    });
}

// Display registered users
function displayUsers() {
    const usersList = document.getElementById('usersList');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.length === 0) {
        usersList.innerHTML = '<div class="empty-state">No registered users yet.</div>';
        return;
    }
    
    usersList.innerHTML = users.map(user => `
        <div class="user-card">
            <h4>${user.fullName}</h4>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone}</p>
            <p><strong>Country:</strong> ${user.country}</p>
            <p><strong>Registered:</strong> ${user.registeredDate}</p>
            <button class="action-btn" onclick="deleteUser(${user.id})">Delete User</button>
        </div>
    `).join('');
}

// Delete user
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
        displayUsers();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    displayUsers();
    
    // Add real-time validation
    document.getElementById('loginEmail').addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            showError('loginEmailError', 'Please enter a valid email address');
        } else {
            document.getElementById('loginEmailError').textContent = '';
        }
    });
    
    document.getElementById('regPassword').addEventListener('input', function() {
        if (this.value && !validatePassword(this.value)) {
            showError('regPasswordError', 'Password must contain uppercase, lowercase, and numbers (min 8 characters)');
        } else {
            document.getElementById('regPasswordError').textContent = '';
        }
    });
    
    document.getElementById('confirmPassword').addEventListener('input', function() {
        const password = document.getElementById('regPassword').value;
        if (this.value && this.value !== password) {
            showError('confirmPasswordError', 'Passwords do not match');
        } else {
            document.getElementById('confirmPasswordError').textContent = '';
        }
    });
});
