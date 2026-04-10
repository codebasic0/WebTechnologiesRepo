<?php
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'college_html_project';

$connection = new mysqli($host, $user, $password);
if ($connection->connect_error) {
    die('Database connection failed: ' . $connection->connect_error);
}

$connection->query("CREATE DATABASE IF NOT EXISTS $database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$connection->select_db($database);

$connection->query(
    "CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        description TEXT NOT NULL,
        sku VARCHAR(100) NOT NULL UNIQUE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);

$successMessage = '';
$errorMessage = '';

function sanitize($value) {
    return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'add') {
        $name = sanitize($_POST['name'] ?? '');
        $category = sanitize($_POST['category'] ?? '');
        $price = (float)($_POST['price'] ?? 0);
        $quantity = (int)($_POST['quantity'] ?? 0);
        $description = sanitize($_POST['description'] ?? '');
        $sku = sanitize($_POST['sku'] ?? '');

        if (strlen($name) < 3 || strlen($category) === 0 || $price <= 0 || $quantity < 0 || strlen($sku) < 3) {
            $errorMessage = 'Please complete all fields with valid product details.';
        } else {
            $stmt = $connection->prepare('INSERT INTO products (name, category, price, quantity, description, sku) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->bind_param('ssdiss', $name, $category, $price, $quantity, $description, $sku);
            if ($stmt->execute()) {
                $successMessage = 'Product added successfully.';
            } else {
                $errorMessage = 'Unable to add product. SKU may already exist.';
            }
            $stmt->close();
        }
    }

    if ($_POST['action'] === 'delete' && !empty($_POST['productId'])) {
        $productId = (int)$_POST['productId'];
        $stmt = $connection->prepare('DELETE FROM products WHERE id = ?');
        $stmt->bind_param('i', $productId);
        if ($stmt->execute()) {
            $successMessage = 'Product deleted successfully.';
        } else {
            $errorMessage = 'Unable to delete product.';
        }
        $stmt->close();
    }
}

$search = sanitize($_GET['search'] ?? '');
$categoryFilter = sanitize($_GET['category'] ?? '');
$query = 'SELECT * FROM products';
$params = [];
$types = '';
$filters = [];
if ($search !== '') {
    $filters[] = '(name LIKE ? OR description LIKE ? OR sku LIKE ?)';
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $types .= 'sss';
}
if ($categoryFilter !== '') {
    $filters[] = 'category = ?';
    $params[] = $categoryFilter;
    $types .= 's';
}
if (!empty($filters)) {
    $query .= ' WHERE ' . implode(' AND ', $filters);
}
$query .= ' ORDER BY created_at DESC';

$stmt = $connection->prepare($query);
if ($stmt) {
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $products = $stmt->get_result();
    $stmt->close();
} else {
    $products = $connection->query('SELECT * FROM products ORDER BY created_at DESC');
}

$totals = $connection->query('SELECT COUNT(*) AS total, COALESCE(SUM(price * quantity),0) AS totalValue, SUM(quantity < 5) AS lowStock FROM products')->fetch_assoc();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exercise 9 - Product Management</title>
    <link rel="stylesheet" href="../../css/style.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav>
        <ul>
            <li><a href="../../index.html">← Back to Home</a></li>
            <li><a href="index.php">Product Management</a></li>
        </ul>
    </nav>

    <header>
        <h1>Product Management System</h1>
        <p>Server-side CRUD with MySQL connection</p>
    </header>

    <main>
        <?php if ($successMessage): ?>
            <div class="message success"><?php echo $successMessage; ?></div>
        <?php endif; ?>
        <?php if ($errorMessage): ?>
            <div class="message error"><?php echo $errorMessage; ?></div>
        <?php endif; ?>

        <section>
            <h2>Add New Product</h2>
            <form id="productForm" class="form-section" method="post" action="">
                <input type="hidden" name="action" value="add">
                <div class="form-row">
                    <div class="form-group">
                        <label for="productName">Product Name:</label>
                        <input type="text" id="productName" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="category">Category:</label>
                        <select id="category" name="category" required>
                            <option value="">-- Select Category --</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Books">Books</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Food">Food & Beverages</option>
                            <option value="Home">Home & Garden</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="price">Price ($):</label>
                        <input type="number" id="price" name="price" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="quantity">Stock Quantity:</label>
                        <input type="number" id="quantity" name="quantity" min="0" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="description">Description:</label>
                    <textarea id="description" name="description" rows="3" required></textarea>
                </div>

                <div class="form-group">
                    <label for="sku">SKU (Stock Keeping Unit):</label>
                    <input type="text" id="sku" name="sku" placeholder="e.g., PROD-001" required>
                </div>

                <button type="submit">Add Product</button>
                <button type="reset" class="secondary">Clear</button>
            </form>
        </section>

        <section>
            <h2>Search & Filter Products</h2>
            <div class="search-bar">
                <form method="get" style="display: flex; gap:1rem; flex-wrap: wrap; width: 100%;">
                    <input type="text" id="searchInput" name="search" placeholder="Search by product name or category..." value="<?php echo htmlspecialchars($search); ?>">
                    <select id="categoryFilter" name="category">
                        <option value="">All Categories</option>
                        <option value="Electronics" <?php echo $categoryFilter === 'Electronics' ? 'selected' : ''; ?>>Electronics</option>
                        <option value="Books" <?php echo $categoryFilter === 'Books' ? 'selected' : ''; ?>>Books</option>
                        <option value="Clothing" <?php echo $categoryFilter === 'Clothing' ? 'selected' : ''; ?>>Clothing</option>
                        <option value="Food" <?php echo $categoryFilter === 'Food' ? 'selected' : ''; ?>>Food & Beverages</option>
                        <option value="Home" <?php echo $categoryFilter === 'Home' ? 'selected' : ''; ?>>Home & Garden</option>
                    </select>
                    <button type="submit">Apply</button>
                    <a href="index.php" class="btn-primary" style="display: inline-flex; align-items: center; justify-content: center;">Reset</a>
                </form>
            </div>
        </section>

        <section>
            <h2>Product Inventory</h2>
            <div class="stats">
                <div class="stat-box"><h4>Total Products</h4><p><?php echo (int)$totals['total']; ?></p></div>
                <div class="stat-box"><h4>Total Value</h4><p>$<?php echo number_format($totals['totalValue'], 2); ?></p></div>
                <div class="stat-box"><h4>Low Stock Items</h4><p><?php echo (int)$totals['lowStock']; ?></p></div>
            </div>
            <table id="productsTable" class="products-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>SKU</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="productsList">
                    <?php if ($products && $products->num_rows > 0): ?>
                        <?php while ($product = $products->fetch_assoc()): ?>
                            <tr>
                                <td data-label="Product Name"><?php echo htmlspecialchars($product['name']); ?></td>
                                <td data-label="Category"><?php echo htmlspecialchars($product['category']); ?></td>
                                <td data-label="Price">$<?php echo number_format($product['price'], 2); ?></td>
                                <td data-label="Stock" class="<?php echo $product['quantity'] < 5 ? 'low-stock' : ''; ?>"><?php echo (int)$product['quantity']; ?></td>
                                <td data-label="SKU"><?php echo htmlspecialchars($product['sku']); ?></td>
                                <td data-label="Actions">
                                    <div class="action-buttons">
                                        <form method="post" action="" style="display:inline;">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="productId" value="<?php echo (int)$product['id']; ?>">
                                            <button type="submit" class="btn-delete">Delete</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <tr><td colspan="6" class="empty-state">No products found. Add your first product above.</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </section>
    </main>

    <footer>
        <p>&copy; 2026 Product Management System. All rights reserved.</p>
        <p>Product Management with PHP & MySQL Concepts - Exercise 9</p>
    </footer>
</body>
</html>
