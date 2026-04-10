?php
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
    "CREATE TABLE IF NOT EXISTS session_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        event_data TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);

$message = '';
$error = '';

function sanitize($value) {
    return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['formType']) && $_POST['formType'] === 'cookie') {
        $cookieName = sanitize($_POST['cookieName'] ?? '');
        $cookieValue = sanitize($_POST['cookieValue'] ?? '');
        $expiryDays = max(1, (int)($_POST['cookieExpiry'] ?? 7));
        $cookiePath = sanitize($_POST['cookiePath'] ?? '/');

        if ($cookieName === '' || $cookieValue === '') {
            $error = 'Cookie name and value cannot be empty.';
        } else {
            setcookie($cookieName, $cookieValue, time() + ($expiryDays * 86400), $cookiePath);
            $_SESSION['cookieMessage'] = "Cookie '$cookieName' has been set. It will be available after the next page refresh.";
            header('Location: index.php');
            exit;
        }
    }

    if (isset($_POST['formType']) && $_POST['formType'] === 'session') {
        $dataKey = sanitize($_POST['dataKey'] ?? '');
        $dataValue = sanitize($_POST['dataValue'] ?? '');
        if ($dataKey === '' || $dataValue === '') {
            $error = 'Session key and value cannot be empty.';
        } else {
            $_SESSION['session_data'][$dataKey] = $dataValue;
            $message = "Session data stored for '$dataKey'.";
        }
    }

    if (isset($_POST['action']) && $_POST['action'] === 'add_cart') {
        $itemName = sanitize($_POST['itemName'] ?? '');
        $itemPrice = (float)($_POST['itemPrice'] ?? 0);
        $itemQuantity = (int)($_POST['itemQuantity'] ?? 0);
        if ($itemName === '' || $itemPrice <= 0 || $itemQuantity < 1) {
            $error = 'Please enter valid cart information.';
        } else {
            $_SESSION['cart'][] = [
                'name' => $itemName,
                'price' => number_format($itemPrice, 2),
                'quantity' => $itemQuantity,
                'total' => number_format($itemPrice * $itemQuantity, 2)
            ];
            $message = "Item '$itemName' added to cart.";
        }
    }
}

$cookieNotice = $_SESSION['cookieMessage'] ?? '';
unset($_SESSION['cookieMessage']);

$sessionStart = $_SESSION['started_at'] ?? date('c');
if (!isset($_SESSION['started_at'])) {
    $_SESSION['started_at'] = $sessionStart;
}

$now = new DateTime();
$start = new DateTime($sessionStart);
$interval = $now->diff($start);
$duration = sprintf('%dh %dm %ds', $interval->h, $interval->i, $interval->s);

function renderValue($value) {
    if (is_array($value)) {
        $content = '<div class="data-sublist">';
        foreach ($value as $subKey => $subValue) {
            $content .= '<div class="data-subitem"><span class="data-item-key">' . htmlspecialchars($subKey) . '</span>: <span class="data-item-value">' . htmlspecialchars((string)$subValue) . '</span></div>';
        }
        $content .= '</div>';
        return $content;
    }
    return htmlspecialchars((string)$value);
}

function formatArray($array) {
    $output = '';
    foreach ($array as $key => $value) {
        $output .= "<div class=\"data-item\"><div class=\"data-item-content\"><div class=\"data-item-key\">" . htmlspecialchars($key) . "</div><div class=\"data-item-value\">" . renderValue($value) . "</div></div></div>";
    }
    return $output ?: '<div class="empty-state">No data available.</div>';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exercise 10 - Sessions & Cookies</title>
    <link rel="stylesheet" href="../../css/style.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav>
        <ul>
            <li><a href="../../index.html">← Back to Home</a></li>
            <li><a href="index.php">Sessions & Cookies</a></li>
        </ul>
    </nav>

    <header>
        <h1>Sessions & Cookies Management</h1>
        <p>Server-side persistence with PHP</p>
    </header>

    <main>
        <?php if ($message): ?><div class="message success"><?php echo $message; ?></div><?php endif; ?>
        <?php if ($error): ?><div class="message error"><?php echo $error; ?></div><?php endif; ?>
        <?php if ($cookieNotice): ?><div class="message success"><?php echo $cookieNotice; ?></div><?php endif; ?>

        <section>
            <h2>Current Session Information</h2>
            <div class="session-info">
                <div class="info-box"><h4>Session ID</h4><p><?php echo session_id(); ?></p></div>
                <div class="info-box"><h4>Session Started</h4><p><?php echo htmlspecialchars($sessionStart); ?></p></div>
                <div class="info-box"><h4>Session Duration</h4><p><?php echo $duration; ?></p></div>
                <div class="info-box"><h4>User Agent</h4><p><?php echo htmlspecialchars($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'); ?></p></div>
            </div>
        </section>

        <section>
            <h2>Set Cookies</h2>
            <form method="post" class="form-section">
                <input type="hidden" name="formType" value="cookie">
                <div class="form-row">
                    <div class="form-group"><label for="cookieName">Cookie Name:</label><input type="text" id="cookieName" name="cookieName" placeholder="e.g., theme" required></div>
                    <div class="form-group"><label for="cookieValue">Cookie Value:</label><input type="text" id="cookieValue" name="cookieValue" placeholder="e.g., dark_mode" required></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label for="cookieExpiry">Expires In (days):</label><input type="number" id="cookieExpiry" name="cookieExpiry" value="7" min="1" required></div>
                    <div class="form-group"><label for="cookiePath">Path:</label><input type="text" id="cookiePath" name="cookiePath" value="/" required></div>
                </div>
                <button type="submit">Set Cookie</button>
            </form>
        </section>

        <section>
            <h2>Store Session Data</h2>
            <form method="post" class="form-section">
                <input type="hidden" name="formType" value="session">
                <div class="form-row">
                    <div class="form-group"><label for="dataKey">Key:</label><input type="text" id="dataKey" name="dataKey" placeholder="e.g., username" required></div>
                    <div class="form-group"><label for="dataValue">Value:</label><input type="text" id="dataValue" name="dataValue" placeholder="Enter the value" required></div>
                </div>
                <button type="submit">Store in Session</button>
            </form>
        </section>

        <section>
            <h2>Active Cookies</h2>
            <div class="data-container"><div id="cookiesList" class="data-list"><?php echo formatArray($_COOKIE); ?></div></div>
        </section>

        <section>
            <h2>Session Storage Data</h2>
            <div class="data-container"><div id="sessionDataList" class="data-list"><?php echo formatArray($_SESSION['session_data'] ?? []); ?></div></div>
        </section>

        <section>
            <h2>Shopping Cart (Session Example)</h2>
            <div class="cart-section">
                <div class="add-item-form">
                    <h3>Add Item to Cart</h3>
                    <form method="post" class="form-section">
                        <div class="form-row">
                            <div class="form-group"><label for="itemName">Item Name:</label><input type="text" id="itemName" name="itemName" required></div>
                            <div class="form-group"><label for="itemPrice">Price:</label><input type="number" id="itemPrice" name="itemPrice" step="0.01" min="0" required></div>
                            <div class="form-group"><label for="itemQuantity">Quantity:</label><input type="number" id="itemQuantity" name="itemQuantity" value="1" min="1" required></div>
                        </div>
                        <button type="submit" name="action" value="add_cart">Add to Cart</button>
                    </form>
                </div>
                <div class="cart-display">
                    <h3>Shopping Cart Items</h3>
                    <div id="cartList" class="data-list"><?php echo formatArray($_SESSION['cart'] ?? []); ?></div>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <p>&copy; 2026 Sessions & Cookies Management. All rights reserved.</p>
        <p>Sessions & Cookies with PHP Concepts - Exercise 10</p>
    </footer>
</body>
</html>
