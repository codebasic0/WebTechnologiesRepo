// Product Management System (PHP & MySQL Simulation)

let products = JSON.parse(localStorage.getItem('products')) || [];
let currentFilter = '';
let sortColumn = 'name';
let sortOrder = 'asc';

// Initialize sample products
function initializeSampleProducts() {
    if (products.length === 0) {
        products = [
            {
                id: 1,
                name: 'Wireless Bluetooth Headphones',
                category: 'Electronics',
                price: 79.99,
                quantity: 15,
                sku: 'ELEC-001',
                description: 'High-quality wireless headphones with noise cancellation',
                createdDate: new Date().toLocaleDateString()
            },
            {
                id: 2,
                name: 'JavaScript Complete Guide',
                category: 'Books',
                price: 49.99,
                quantity: 8,
                sku: 'BOOK-001',
                description: 'Comprehensive guide to JavaScript programming',
                createdDate: new Date().toLocaleDateString()
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }
}

// Add Product
function addProduct(event) {
    event.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('category').value;
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const description = document.getElementById('description').value.trim();
    const sku = document.getElementById('sku').value.trim().toUpperCase();

    // Validation
    if (!name || name.length < 3) {
        showMessage('addMessage', 'Error: Product name must be at least 3 characters', 'error');
        return;
    }

    if (!category) {
        showMessage('addMessage', 'Error: Please select a category', 'error');
        return;
    }

    if (price < 0) {
        showMessage('addMessage', 'Error: Price cannot be negative', 'error');
        return;
    }

    if (quantity < 0) {
        showMessage('addMessage', 'Error: Quantity cannot be negative', 'error');
        return;
    }

    // Check for duplicate SKU
    if (products.some(p => p.sku === sku)) {
        showMessage('addMessage', 'Error: SKU already exists', 'error');
        return;
    }

    // Create product object
    const product = {
        id: Date.now(),
        name: sanitizeInput(name),
        category: category,
        price: price,
        quantity: quantity,
        sku: sku,
        description: sanitizeInput(description),
        createdDate: new Date().toLocaleDateString(),
        updatedDate: new Date().toLocaleDateString()
    };

    // Insert into "database" (localStorage)
    products.push(product);
    saveProducts();

    // Show success message
    showMessage('addMessage', `✓ Product "${product.name}" added successfully!`, 'success');

    // Reset form
    document.getElementById('productForm').reset();

    // Update display
    displayProducts();
}

// Display Products
function displayProducts(productsToDisplay = null) {
    const tbody = document.getElementById('productsList');
    const emptyState = document.getElementById('emptyState');
    const displayedProducts = productsToDisplay || products;

    if (displayedProducts.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        updateStats([]);
        return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = displayedProducts.map(product => `
        <tr>
            <td data-label="Product Name">${product.name}</td>
            <td data-label="Category">${product.category}</td>
            <td data-label="Price">$${product.price.toFixed(2)}</td>
            <td data-label="Stock" class="${product.quantity < 5 ? 'low-stock' : ''}">${product.quantity}</td>
            <td data-label="SKU">${product.sku}</td>
            <td data-label="Actions">
                <div class="action-buttons">
                    <button class="btn-view" onclick="viewProduct(${product.id})">View</button>
                    <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');

    updateStats(displayedProducts);
}

// View Product
function viewProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        alert(`
Product Details:
Name: ${product.name}
Category: ${product.category}
Price: $${product.price.toFixed(2)}
Stock: ${product.quantity}
SKU: ${product.sku}
Description: ${product.description}
Created: ${product.createdDate}
        `);
    }
}

// Edit Product
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('editId').value = product.id;
    document.getElementById('editName').value = product.name;
    document.getElementById('editCategory').value = product.category;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editQuantity').value = product.quantity;
    document.getElementById('editDescription').value = product.description;

    document.getElementById('editModal').classList.add('show');
}

// Update Product
function updateProduct(event) {
    event.preventDefault();

    const id = parseInt(document.getElementById('editId').value);
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) return;

    // Get form values
    const name = document.getElementById('editName').value.trim();
    const category = document.getElementById('editCategory').value;
    const price = parseFloat(document.getElementById('editPrice').value);
    const quantity = parseInt(document.getElementById('editQuantity').value);
    const description = document.getElementById('editDescription').value.trim();

    // Validation
    if (!name || name.length < 3) {
        alert('Product name must be at least 3 characters');
        return;
    }

    if (price < 0 || quantity < 0) {
        alert('Price and quantity cannot be negative');
        return;
    }

    // Update product
    products[productIndex].name = sanitizeInput(name);
    products[productIndex].category = category;
    products[productIndex].price = price;
    products[productIndex].quantity = quantity;
    products[productIndex].description = sanitizeInput(description);
    products[productIndex].updatedDate = new Date().toLocaleDateString();

    saveProducts();
    displayProducts();
    closeModal();

    alert('✓ Product updated successfully!');
}

// Delete Product
function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        displayProducts();
    }
}

// Search Products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const category = document.getElementById('categoryFilter').value;

    let filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) ||
                            p.sku.toLowerCase().includes(searchTerm) ||
                            p.description.toLowerCase().includes(searchTerm);
        const matchesCategory = category === '' || p.category === category;
        return matchesSearch && matchesCategory;
    });

    displayProducts(filtered);
}

// Filter by Category
function filterByCategory() {
    searchProducts();
}

// Reset Filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    displayProducts();
}

// Sort Table
function sortTable(column) {
    if (sortColumn === column) {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortOrder = 'asc';
    }

    products.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (sortOrder === 'asc') {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });

    displayProducts();
}

// Update Statistics
function updateStats(displayedProducts) {
    const total = displayedProducts.length;
    const totalValue = displayedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const lowStock = displayedProducts.filter(p => p.quantity < 5).length;

    document.getElementById('totalProducts').textContent = total;
    document.getElementById('totalValue').textContent = totalValue.toFixed(2);
    document.getElementById('lowStockCount').textContent = lowStock;
}

// Save Products to localStorage
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

// Utility Functions
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.className = type;
    element.textContent = message;
}

// Modal Functions
function closeModal() {
    document.getElementById('editModal').classList.remove('show');
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeSampleProducts();
    displayProducts();
});
