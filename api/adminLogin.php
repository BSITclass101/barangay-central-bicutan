<?php

// ============================================
// CORS - Allow any localhost port
// ============================================
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (preg_match('/^https?:\/\/localhost(?::\d+)?$/', $origin)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Credentials: true");
    header("Vary: Origin");
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// ============================================
// OPTIONS / PREFLIGHT
// ============================================
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// ============================================
// DATABASE
// ============================================
require_once __DIR__ . '/../config/db.php';

// ============================================
// HELPERS
// ============================================
function loginResponse(int $statusCode, array $data): void
{
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function createApiSession(PDO $pdo, int $userId): array
{
    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);
    $expiresAt = date('Y-m-d H:i:s', time() + (8 * 60 * 60));

    $stmt = $pdo->prepare("
        INSERT INTO api_sessions
            (user_id, token_hash, expires_at)
        VALUES
            (:user_id, :token_hash, :expires_at)
    ");

    $stmt->execute([
        'user_id' => $userId,
        'token_hash' => $tokenHash,
        'expires_at' => $expiresAt
    ]);

    return ['token' => $token, 'expires_at' => $expiresAt];
}

// ============================================
// GET JSON INPUT
// ============================================
$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    loginResponse(400, ["success" => false, "message" => "Invalid request data"]);
}

$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

if ($username === '' || $password === '') {
    loginResponse(400, ["success" => false, "message" => "Please provide username and password"]);
}

try {

    // ============================================
    // 🚨 MASTER ADMIN
    // ============================================
    $MASTER_USERNAME = "masteradmin";
    $MASTER_PASSWORD = "12345";

    if ($username === $MASTER_USERNAME && $password === $MASTER_PASSWORD) {

        $allActions = ["view" => true, "create" => true, "edit" => true, "delete" => true];

        $masterPermissions = [
            "userManagement" => ["officials" => $allActions, "residents" => $allActions, "roles" => $allActions],
            "residentsRecord" => ["residentsList" => $allActions],
            "communityHousehold" => ["households" => $allActions],
            "certificateIssuance" => ["certificates" => $allActions],
            "serviceRequests" => ["requests" => $allActions],
            "blotterRecords" => ["blotter" => $allActions],
            "incidentReports" => ["incidents" => $allActions],
            "reportsModule" => ["reports" => $allActions],
            "settingsModule" => ["settings" => $allActions]
        ];

        $session = createApiSession($pdo, 0);

        loginResponse(200, [
            "success" => true,
            "message" => "Master admin login successful",
            "token" => $session['token'],
            "expires_at" => $session['expires_at'],
            "user" => [
                "id" => 0,
                "username" => "masteradmin",
                "firstName" => "Master",
                "lastName" => "Admin",
                "role" => "Admin",
                "role_id" => null,
                "status" => "Active",
                "permissions" => $masterPermissions,
                "isMasterAdmin" => true
            ]
        ]);
    }

    // ============================================
    // STEP 1: ADMIN / STAFF LOGIN
    // ============================================
    $stmt = $pdo->prepare("
        SELECT
            u.id, u.first_name, u.last_name, u.username,
            u.password, u.role, u.status,
            r.id AS role_id, r.name AS role_name, r.permissions AS role_permissions
        FROM users u
        LEFT JOIN roles r ON LOWER(TRIM(u.role)) = LOWER(TRIM(r.name))
        WHERE u.username = ?
        LIMIT 1
    ");

    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {

        if (strtolower(trim($user['status'] ?? '')) !== 'active') {
            loginResponse(403, ["success" => false, "message" => "This account is inactive."]);
        }

        $roleName = trim($user['role_name'] ?? $user['role'] ?? '');
        $permissions = [];

        if (!empty($user['role_permissions'])) {
            $decodedPermissions = json_decode($user['role_permissions'], true);
            if (is_array($decodedPermissions)) {
                $permissions = $decodedPermissions;
            }
        }

        if (strtolower($roleName) === 'admin') {
            $allActions = ["view" => true, "create" => true, "edit" => true, "delete" => true];
            $permissions = [
                "userManagement" => ["officials" => $allActions, "residents" => $allActions, "roles" => $allActions],
                "residentsRecord" => ["residentsList" => $allActions],
                "communityHousehold" => ["households" => $allActions],
                "certificateIssuance" => ["certificates" => $allActions],
                "serviceRequests" => ["requests" => $allActions],
                "blotterRecords" => ["blotter" => $allActions],
                "incidentReports" => ["incidents" => $allActions],
                "reportsModule" => ["reports" => $allActions],
                "settingsModule" => ["settings" => $allActions]
            ];
        }

        $session = createApiSession($pdo, (int) $user['id']);

        loginResponse(200, [
            "success" => true,
            "message" => "Login successful",
            "token" => $session['token'],
            "expires_at" => $session['expires_at'],
            "user" => [
                "id" => (int) $user['id'],
                "username" => $user['username'],
                "firstName" => $user['first_name'],
                "lastName" => $user['last_name'],
                "role_id" => $user['role_id'] !== null ? (int) $user['role_id'] : null,
                "role" => $roleName,
                "status" => $user['status'],
                "permissions" => $permissions
            ]
        ]);
    }

    // ============================================
    // STEP 2: RESIDENT LOGIN
    // ✅ SET ONLINE PAGKA-LOGIN
    // ============================================
    $stmt = $pdo->prepare("
        SELECT
            id, resident_id, first_name, middle_name, last_name, suffix,
            email_address, mobile_number, profile_picture,
            password_hash, account_status, status
        FROM residents
        WHERE resident_id = ? OR email_address = ? OR mobile_number = ?
        LIMIT 1
    ");

    $stmt->execute([$username, $username, $username]);
    $resident = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($resident) {

        if (empty($resident['password_hash'])) {
            loginResponse(403, ["success" => false, "message" => "Account is not yet activated. Please contact the barangay office."]);
        }

        $statusCheck = strtolower(trim($resident['status'] ?? ''));
        $accountStatusCheck = strtolower(trim($resident['account_status'] ?? ''));

        if ($statusCheck === 'inactive' || $accountStatusCheck === 'inactive') {
            loginResponse(403, ["success" => false, "message" => "Your account is inactive. Please contact the barangay office."]);
        }

        if (!password_verify($password, $resident['password_hash'])) {
            loginResponse(401, ["success" => false, "message" => "Invalid username or password"]);
        }

        // ✅ SET RESIDENT ONLINE
        $updateStmt = $pdo->prepare("
            UPDATE residents SET is_online = 1 WHERE id = ?
        ");
        $updateStmt->execute([(int)$resident['id']]);

        loginResponse(200, [
            "success" => true,
            "message" => "Login successful",
            "user" => [
                "id" => (int) $resident['id'],
                "resident_id" => $resident['resident_id'],
                "username" => $resident['resident_id'],
                "firstName" => $resident['first_name'],
                "middleName" => $resident['middle_name'],
                "lastName" => $resident['last_name'],
                "suffix" => $resident['suffix'],
                "email" => $resident['email_address'],
                "mobile" => $resident['mobile_number'],
                "profile_picture" => $resident['profile_picture'],
                "role" => "resident",
                "role_id" => null,
                "status" => $resident['status'],
                "account_status" => $resident['account_status'],
                "is_online" => 1,
                "permissions" => []
            ]
        ]);
    }

    // ============================================
    // STEP 3: INVALID
    // ============================================
    loginResponse(401, ["success" => false, "message" => "Invalid username or password"]);

} catch (Throwable $e) {
    error_log('Login error: ' . $e->getMessage());
    loginResponse(500, ["success" => false, "message" => "A server error occurred during login."]);
}