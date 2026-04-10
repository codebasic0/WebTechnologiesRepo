<?php
session_start();
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
    "CREATE TABLE IF NOT EXISTS contact_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        priority VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        subscribe TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        user_agent VARCHAR(255) DEFAULT ''
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);

$connection->query(
    "CREATE TABLE IF NOT EXISTS order_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        product VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        address TEXT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);

$successMessage = '';
$errorMessage = '';

function sanitize($value) {
    return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!empty($_POST['formType']) && $_POST['formType'] === 'contact') {
        $name = sanitize($_POST['name'] ?? '');
        $email = sanitize($_POST['email'] ?? '');
        $category = sanitize($_POST['category'] ?? 'general');
        $priority = sanitize($_POST['priority'] ?? 'low');
        $message = sanitize($_POST['message'] ?? '');
        $subscribe = isset($_POST['subscribe']) ? 1 : 0;
        $userAgent = sanitize($_SERVER['HTTP_USER_AGENT'] ?? '');

        if (strlen($name) < 3 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($message) < 10) {
            $errorMessage = 'Please provide a valid name, email, and message before submitting.';
        } else {
            $stmt = $connection->prepare(
                'INSERT INTO contact_submissions (name, email, category, priority, message, subscribe, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->bind_param('sssssds', $name, $email, $category, $priority, $message, $subscribe, $userAgent);
            if ($stmt->execute()) {
                $successMessage = 'Contact form submitted successfully. Your request is stored in the database.';
            } else {
                $errorMessage = 'Unable to save contact form data. Please try again.';
            }
            $stmt->close();
        }
    }

    if (!empty($_POST['formType']) && $_POST['formType'] === 'order') {
        $customerName = sanitize($_POST['customerName'] ?? '');
        $product = sanitize($_POST['product'] ?? '');
        $quantity = (int)($_POST['quantity'] ?? 1);
        $address = sanitize($_POST['address'] ?? '');
        $paymentMethod = sanitize($_POST['paymentMethod'] ?? '');
        $priceMap = ['laptop' => 999.99, 'phone' => 699.99, 'tablet' => 499.99, 'watch' => 299.99];
        $price = $priceMap[$product] ?? 0.00;
        $total = $price * $quantity;

        if (strlen($customerName) < 3 || strlen($product) === 0 || $quantity < 1 || strlen($address) < 10 || strlen($paymentMethod) === 0) {
            $errorMessage = 'Please complete all order fields with valid values.';
        } else {
            $stmt = $connection->prepare(
                'INSERT INTO order_submissions (customer_name, product, quantity, price, address, payment_method, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?)' 
            );
            $stmt->bind_param('ssiddsd', $customerName, $product, $quantity, $price, $address, $paymentMethod, $total);
            if ($stmt->execute()) {
                $successMessage = 'Order placed successfully. Your order has been recorded in the database.';
            } else {
                $errorMessage = 'Unable to save order details. Please try again later.';
            }
            $stmt->close();
        }
    }
}

$contactResults = $connection->query('SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 10');
$orderResults = $connection->query('SELECT * FROM order_submissions ORDER BY created_at DESC LIMIT 10');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exercise 8 - PHP Form Handling</title>
    <link rel="stylesheet" href="../../css/style.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav>
        <ul>
            <li><a href="../../index.html">← Back to Home</a></li>
            <li><a href="index.php">PHP Form Handling</a></li>
        </ul>
    </nav>

    <header>
        <h1>Secure Form Handling with PHP</h1>
        <p>Server-side processing connected to MySQL</p>
    </header>

    <main>
        <div class="container">
            <?php if ($successMessage): ?>
                <div class="message success"><?php echo $successMessage; ?></div>
            <?php endif; ?>
            <?php if ($errorMessage): ?>
                <div class="message error"><?php echo $errorMessage; ?></div>
            <?php endif; ?>

            <section>
                <h2>Contact Form</h2>
                <form id="contactForm" class="form-section" method="post" action="">
                    <input type="hidden" name="formType" value="contact">
                    <div class="form-group">
                        <label for="name">Full Name:</label>
                        <input type="text" id="name" name="name" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email Address:</label>
                        <input type="email" id="email" name="email" required>
                    </div>

                    <div class="form-group">
                        <label for="category">Category:</label>
                        <select id="category" name="category" required>
                            <option value="general">General Inquiry</option>
                            <option value="support">Technical Support</option>
                            <option value="sales">Sales</option>
                            <option value="feedback">Feedback</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="priority">Priority:</label>
                        <div class="radio-group">
                            <label><input type="radio" name="priority" value="low" checked> Low</label>
                            <label><input type="radio" name="priority" value="medium"> Medium</label>
                            <label><input type="radio" name="priority" value="high"> High</label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="message">Message:</label>
                        <textarea id="message" name="message" rows="5" required></textarea>
                    </div>

                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="subscribe" value="1">
                            Subscribe to our newsletter
                        </label>
                    </div>

                    <button type="submit">Submit Form</button>
                    <button type="reset" class="secondary">Reset</button>
                </form>
            </section>

            <section>
                <h2>Product Order Form</h2>
                <form id="orderForm" class="form-section" method="post" action="">
                    <input type="hidden" name="formType" value="order">
                    <div class="form-group">
                        <label for="customerName">Customer Name:</label>
                        <input type="text" id="customerName" name="customerName" required>
                    </div>

                    <div class="form-group">
                        <label for="product">Select Product:</label>
                        <select id="product" name="product" required>
                            <option value="">-- Select Product --</option>
                            <option value="laptop">Laptop - $999.99</option>
                            <option value="phone">Smartphone - $699.99</option>
                            <option value="tablet">Tablet - $499.99</option>
                            <option value="watch">Smartwatch - $299.99</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="quantity">Quantity:</label>
                        <input type="number" id="quantity" name="quantity" min="1" value="1" required>
                    </div>

                    <div class="form-group">
                        <label for="address">Delivery Address:</label>
                        <textarea id="address" name="address" rows="3" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="paymentMethod">Payment Method:</label>
                        <select id="paymentMethod" name="paymentMethod" required>
                            <option value="creditcard">Credit Card</option>
                            <option value="debitcard">Debit Card</option>
                            <option value="paypal">PayPal</option>
                            <option value="bankTransfer">Bank Transfer</option>
                        </select>
                    </div>

                    <button type="submit">Place Order</button>
                    <button type="reset" class="secondary">Clear</button>
                </form>
            </section>

            <section>
                <h2>Recent Contact Submissions</h2>
                <div class="submissions-list">
                    <?php if ($contactResults && $contactResults->num_rows > 0): ?>
                        <?php while ($row = $contactResults->fetch_assoc()): ?>
                            <div class="submission-item">
                                <div class="submission-header">
                                    <h4><?php echo htmlspecialchars($row['name']); ?></h4>
                                    <span class="submission-time"><?php echo htmlspecialchars($row['created_at']); ?></span>
                                </div>
                                <div class="submission-details">
                                    <div class="submission-field"><label>Email</label><p><?php echo htmlspecialchars($row['email']); ?></p></div>
                                    <div class="submission-field"><label>Category</label><p><?php echo htmlspecialchars($row['category']); ?></p></div>
                                    <div class="submission-field"><label>Priority</label><p><?php echo htmlspecialchars($row['priority']); ?></p></div>
                                    <div class="submission-field"><label>Subscribed</label><p><?php echo $row['subscribe'] ? 'Yes' : 'No'; ?></p></div>
                                </div>
                                <div class="submission-field" style="grid-column: 1/-1; margin-top: 1rem;"><label>Message</label><p><?php echo nl2br(htmlspecialchars($row['message'])); ?></p></div>
                            </div>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <div class="empty-state">No contact submissions available yet.</div>
                    <?php endif; ?>
                </div>
            </section>

            <section>
                <h2>Recent Orders</h2>
                <div class="submissions-list">
                    <?php if ($orderResults && $orderResults->num_rows > 0): ?>
                        <?php while ($order = $orderResults->fetch_assoc()): ?>
                            <div class="submission-item">
                                <div class="submission-header">
                                    <h4><?php echo htmlspecialchars($order['customer_name']); ?></h4>
                                    <span class="submission-time"><?php echo htmlspecialchars($order['created_at']); ?></span>
                                </div>
                                <div class="submission-details">
                                    <div class="submission-field"><label>Product</label><p><?php echo htmlspecialchars($order['product']); ?></p></div>
                                    <div class="submission-field"><label>Quantity</label><p><?php echo htmlspecialchars($order['quantity']); ?></p></div>
                                    <div class="submission-field"><label>Price</label><p>$<?php echo number_format($order['price'], 2); ?></p></div>
                                    <div class="submission-field"><label>Total</label><p>$<?php echo number_format($order['total_amount'], 2); ?></p></div>
                                </div>
                                <div class="submission-field" style="grid-column: 1/-1; margin-top: 1rem;"><label>Address</label><p><?php echo nl2br(htmlspecialchars($order['address'])); ?></p></div>
                            </div>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <div class="empty-state">No orders recorded yet.</div>
                    <?php endif; ?>
                </div>
            </section>
        </div>
    </main>

    <footer>
        <p>&copy; 2026 Form Processing System. All rights reserved.</p>
        <p>Form Handling & PHP Concepts - Exercise 8</p>
    </footer>
</body>
</html>
