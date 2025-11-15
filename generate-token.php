<?php
/**
 * Customer Token Generator - For Hostinger Shared Hosting
 * 
 * Usage: 
 * 1. Upload this file to your Hostinger hosting (e.g., public_html/generate-token.php)
 * 2. Visit: https://smartbarexam.com/generate-token.php?email=student@example.com&admin_key=YOUR_SECRET_KEY
 * 
 * The script will:
 * - Generate a unique customer token
 * - Save it to customers.json
 * - Display the token for sharing with students
 * - Send an email (if configured)
 */

// Configuration
define('ADMIN_PASSWORD', 'your-secret-key-change-this'); // Change this to a strong password!
define('DATA_DIR', __DIR__ . '/data');
define('CUSTOMERS_FILE', DATA_DIR . '/customers.json');

// Security: Check admin key
$admin_key = isset($_GET['admin_key']) ? $_GET['admin_key'] : '';
$email = isset($_GET['email']) ? trim($_GET['email']) : '';

// Validate admin key
if ($admin_key !== ADMIN_PASSWORD) {
    http_response_code(401);
    die(json_encode(['error' => 'Unauthorized. Invalid admin_key.']));
}

// Validate email
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    die(json_encode(['error' => 'Invalid email address']));
}

// Ensure data directory exists
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

// Load existing customers
$customers = loadCustomers();

// Check if email already exists
foreach ($customers as $customer) {
    if ($customer['email'] === $email) {
        http_response_code(400);
        die(json_encode(['error' => 'Email already exists']));
    }
}

// Generate new customer token
$customer_id = 'cust-' . time();
$customer_token = 'cust_' . bin2hex(random_bytes(12));

$new_customer = [
    'id' => $customer_id,
    'email' => $email,
    'token' => $customer_token,
    'status' => 'active',
    'createdAt' => date('c'),
    'lastLogin' => null
];

// Add to customers array
$customers[] = $new_customer;

// Save customers
if (saveCustomers($customers)) {
    // Success!
    header('Content-Type: application/json');
    http_response_code(201);
    echo json_encode([
        'ok' => true,
        'customer' => $new_customer,
        'message' => 'Customer created successfully'
    ]);
} else {
    http_response_code(500);
    die(json_encode(['error' => 'Failed to save customer']));
}

/**
 * Load customers from JSON file
 */
function loadCustomers() {
    if (file_exists(CUSTOMERS_FILE)) {
        $json = file_get_contents(CUSTOMERS_FILE);
        $data = json_decode($json, true);
        return isset($data['customers']) ? $data['customers'] : [];
    }
    return [];
}

/**
 * Save customers to JSON file
 */
function saveCustomers($customers) {
    $data = ['customers' => $customers];
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
    $result = file_put_contents(CUSTOMERS_FILE, $json);
    if ($result === false) {
        error_log('Failed to write to ' . CUSTOMERS_FILE);
        return false;
    }
    
    // Set proper permissions
    chmod(CUSTOMERS_FILE, 0644);
    return true;
}
?>
