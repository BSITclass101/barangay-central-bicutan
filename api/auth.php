
<?php
// barangay-api/api/auth.php

require_once __DIR__ . '/../config/db.php';

/**
 * Kunin ang Bearer token mula sa request headers.
 */
function getBearerToken(): ?string
{
    $headers = function_exists('getallheaders')
        ? getallheaders()
        : [];

    $authorization = $headers['Authorization']
        ?? $headers['authorization']
        ?? $_SERVER['HTTP_AUTHORIZATION']
        ?? '';

    if (preg_match('/Bearer\s+(\S+)/i', $authorization, $matches)) {
        return $matches[1];
    }

    return null;
}

/**
 * I-verify ang token sa api_sessions table.
 * Nagbabalik ng user data at permissions kapag valid.
 */
function requireAuth(PDO $pdo): array
{
    $token = getBearerToken();

    if (!$token) {
        sendAuthError(401, 'Missing authentication token.');
    }

    $tokenHash = hash('sha256', $token);

    $sql = "
        SELECT
            u.id,
            u.first_name,
            u.last_name,
            u.username,
            u.role,
            u.status,
            r.id AS role_id,
            r.permissions AS role_permissions,
            s.expires_at
        FROM api_sessions s
        INNER JOIN users u ON u.id = s.user_id
        LEFT JOIN roles r
            ON LOWER(TRIM(r.name)) = LOWER(TRIM(u.role))
        WHERE s.token_hash = :token_hash
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['token_hash' => $tokenHash]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendAuthError(401, 'Invalid session token.');
    }

    if (strtotime($user['expires_at']) <= time()) {
        $delete = $pdo->prepare(
            'DELETE FROM api_sessions WHERE token_hash = :token_hash'
        );
        $delete->execute(['token_hash' => $tokenHash]);

        sendAuthError(401, 'Session expired. Please log in again.');
    }

    if (strcasecmp($user['status'], 'Active') !== 0) {
        sendAuthError(403, 'Your account is inactive.');
    }

    $role = strtolower(trim($user['role'] ?? ''));

    $permissions = json_decode(
        $user['role_permissions'] ?? '',
        true
    );

    if (!is_array($permissions)) {
        $permissions = [];
    }

    // Admin lang ang awtomatikong may full access.
    if ($role === 'admin') {
        $permissions = [
            'userManagement' => [
                'officials' => [
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => true
                ],
                'residents' => [
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => true
                ],
                'roles' => [
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => true
                ]
            ],
            'residentsRecord' => [
                'residentsList' => [
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => true
                ]
            ],
            'communityHousehold' => [
                'households' => [
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => true
                ]
            ],
            'certificateIssuance' => [
                'certificates' => [
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => true
                ]
            ],
            'serviceRequests' => [
                'requests' => [
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => true
                ]
            ],
            'blotterRecords' => [
                'blotter' => [
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => true
                ]
            ],
            'incidentReports' => [
                'incidents' => [
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => true
                ]
            ],
            'reportsModule' => [
                'reports' => [
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => true
                ]
            ],
            'settingsModule' => [
                'settings' => [
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => true
                ]
            ]
        ];
    }

    return [
        'id' => (int) $user['id'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'username' => $user['username'],
        'role' => $user['role'],
        'role_id' => $user['role_id'] !== null
            ? (int) $user['role_id']
            : null,
        'permissions' => $permissions
    ];
}

/**
 * Suriin kung may permission ang user.
 */
function hasPermission(
    array $user,
    string $section,
    string $module,
    string $action
): bool {
    if (strtolower(trim($user['role'] ?? '')) === 'admin') {
        return true;
    }

    return ($user['permissions'][$section][$module][$action] ?? false)
        === true;
}

/**
 * I-require ang partikular na permission.
 */
function requirePermission(
    array $user,
    string $section,
    string $module,
    string $action
): void {
    if (!in_array($action, ['view', 'create', 'edit', 'delete'], true)) {
        sendAuthError(400, 'Invalid permission action.');
    }

    if (!hasPermission($user, $section, $module, $action)) {
        sendAuthError(403, 'You do not have permission to perform this action.');
    }
}

/**
 * JSON error response.
 */
function sendAuthError(int $statusCode, string $message): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'success' => false,
        'message' => $message
    ]);

    exit;
}
