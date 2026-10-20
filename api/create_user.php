<?php
// api/create_user.php
header("Access-Control-Allow-Origin: http://localhost:5180");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once '../config/db.php';

// Siguraduhing POST ang method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// Kunin ang data mula sa request
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';
$role_id = intval($data['role_id'] ?? 2); // Default: 2 (Staff)
$status = trim($data['status'] ?? 'active');

// Basic validation
if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Username and password are required"]);
    exit;
}

try {
    // 1. Check kung existing na ang username
    $checkStmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $checkStmt->execute([$username]);
    if ($checkStmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(["success" => false, "message" => "Username already exists!"]);
        exit;
    }

    // 2. I-hash ang password (PINAKAIMPORTANTE)
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 3. I-save sa users table
    $sql = "INSERT INTO users (username, password, role_id, status, created_at) VALUES (?, ?, ?, ?, NOW())";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$username, $hashed_password, $role_id, $status]);

    // 4. Kunin ang ID ng bagong gawa
    $new_id = $pdo->lastInsertId();

    echo json_encode([
        "success" => true,
        "message" => "User created successfully!",
        "user" => [
            "id" => $new_id,
            "username" => $username,
            "role_id" => $role_id,
            "status" => $status
        ]
    ]);

    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    exit;
}
?>