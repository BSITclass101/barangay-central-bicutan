<?php
// api/certificate_types.php
// ✅ Certificate Types API — para sa dropdown ng residents

// =====================================================
// CORS
// =====================================================
$origin = $_SERVER["HTTP_ORIGIN"] ?? "";
if (preg_match('/^https?:\/\/localhost(?::\d+)?$/', $origin)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Credentials: true");
    header("Vary: Origin");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

// =====================================================
// DATABASE
// =====================================================
require_once "../config/db.php";

// =====================================================
// RESPONSE
// =====================================================
function response($success, $message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        "success" => $success,
        "message" => $message,
        "data" => $data
    ]);
    exit;
}

// =====================================================
// METHOD
// =====================================================
$method = $_SERVER["REQUEST_METHOD"];

try {

    // GET — List all active certificate types
    if ($method === "GET") {
        $stmt = $pdo->query("
            SELECT id, name, fee, validity_days, is_active, created_at
            FROM certificate_types
            WHERE is_active = 1
            ORDER BY name ASC
        ");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        response(true, "Certificate types retrieved successfully.", $data);
    }

    // POST — Create new
    if ($method === "POST") {
        $input = json_decode(file_get_contents("php://input"), true);

        if (empty($input["name"])) {
            response(false, "Certificate name is required.", null, 422);
        }

        $stmt = $pdo->prepare("
            INSERT INTO certificate_types (name, fee, validity_days, is_active)
            VALUES (?, ?, ?, 1)
        ");
        $stmt->execute([
            trim($input["name"]),
            (float)($input["fee"] ?? 0),
            (int)($input["validity_days"] ?? 30),
        ]);

        response(true, "Certificate type created successfully.", [
            "id" => $pdo->lastInsertId()
        ], 201);
    }

    // PUT — Update
    if ($method === "PUT") {
        $input = json_decode(file_get_contents("php://input"), true);
        $id = (int)($_GET["id"] ?? 0);

        if ($id <= 0) response(false, "Invalid ID.", null, 400);

        $stmt = $pdo->prepare("
            UPDATE certificate_types
            SET name = ?, fee = ?, validity_days = ?, is_active = ?
            WHERE id = ?
        ");
        $stmt->execute([
            trim($input["name"]),
            (float)($input["fee"] ?? 0),
            (int)($input["validity_days"] ?? 30),
            (int)($input["is_active"] ?? 1),
            $id,
        ]);

        response(true, "Certificate type updated successfully.");
    }

    // DELETE — Soft delete
    if ($method === "DELETE") {
        $id = (int)($_GET["id"] ?? 0);

        if ($id <= 0) response(false, "Invalid ID.", null, 400);

        $stmt = $pdo->prepare("UPDATE certificate_types SET is_active = 0 WHERE id = ?");
        $stmt->execute([$id]);

        response(true, "Certificate type deleted successfully.");
    }

    response(false, "Method not allowed.", null, 405);

} catch (PDOException $e) {
    error_log("Certificate Types PDO Error: " . $e->getMessage());
    response(false, "Database error: " . $e->getMessage(), null, 500);
} catch (Throwable $e) {
    error_log("Certificate Types Error: " . $e->getMessage());
    response(false, "Server error: " . $e->getMessage(), null, 500);
}
?>