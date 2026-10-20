<?php

// =====================================================
// CERTIFICATE REQUESTS API
// =====================================================

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

// =====================================================
// PREFLIGHT
// =====================================================

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
// JSON INPUT
// =====================================================

function getJsonInput() {
    $input = file_get_contents("php://input");
    if (!$input) return [];
    $data = json_decode($input, true);
    if (!is_array($data)) {
        response(false, "Invalid JSON request.", null, 400);
    }
    return $data;
}

// =====================================================
// CLEAN
// =====================================================

function clean($value) {
    if ($value === null) return null;
    $value = trim((string)$value);
    return $value === "" ? null : $value;
}

// =====================================================
// GENERATE REFERENCE NUMBER
// =====================================================

function generateReferenceNo($pdo) {
    do {
        $random = strtoupper(bin2hex(random_bytes(4)));
        $referenceNo = "REQ-" . date("Y") . "-" . $random;

        $stmt = $pdo->prepare("
            SELECT id FROM certificate_requests
            WHERE reference_no = ? LIMIT 1
        ");
        $stmt->execute([$referenceNo]);
        $exists = $stmt->fetch(PDO::FETCH_ASSOC);
    } while ($exists);

    return $referenceNo;
}

// =====================================================
// METHOD
// =====================================================

$method = $_SERVER["REQUEST_METHOD"];

try {

    // =================================================
    // GET — List requests
    // =================================================

    if ($method === "GET") {

        $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
        $residentId = isset($_GET["resident_id"]) ? (int)$_GET["resident_id"] : 0;
        $status = clean($_GET["status"] ?? null);

        // --- Single request ---
        if ($id > 0) {

            $stmt = $pdo->prepare("
                SELECT
                    cr.*,
                    ci.name AS certificate_name,
                    ci.certificate_fee,
                    ci.pdf_path AS template_pdf,
                    CONCAT(
                        r.first_name, ' ',
                        IFNULL(CONCAT(r.middle_name, ' '), ''),
                        r.last_name,
                        IFNULL(CONCAT(' ', r.suffix), '')
                    ) AS resident_name,
                    r.resident_id AS resident_code,
                    r.email_address,
                    r.mobile_number
                FROM certificate_requests cr
                INNER JOIN certificate_issuances ci ON ci.id = cr.certificate_id
                INNER JOIN residents r ON r.id = cr.resident_id
                WHERE cr.id = ?
                LIMIT 1
            ");
            $stmt->execute([$id]);
            $request = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$request) {
                response(false, "Request not found.", null, 404);
            }

            // Fetch form fields for this certificate
            $stmt = $pdo->prepare("
                SELECT * FROM certificate_form_fields
                WHERE certificate_id = ?
                ORDER BY field_order ASC, id ASC
            ");
            $stmt->execute([$request["certificate_id"]]);
            $request["form_fields"] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Decode JSON
            $request["field_values"] = $request["field_values"]
                ? json_decode($request["field_values"], true)
                : new stdClass();

            response(true, "Request retrieved successfully.", $request);
        }

        // --- List all ---
        $sql = "
            SELECT
                cr.id,
                cr.reference_no,
                cr.certificate_id,
                cr.resident_id,
                cr.status,
                cr.payment_status,
                cr.pdf_path,
                cr.created_at,
                ci.name AS certificate_name,
                ci.certificate_fee,
                CONCAT(
                    r.first_name, ' ',
                    IFNULL(CONCAT(r.middle_name, ' '), ''),
                    r.last_name,
                    IFNULL(CONCAT(' ', r.suffix), '')
                ) AS resident_name,
                r.resident_id AS resident_code
            FROM certificate_requests cr
            INNER JOIN certificate_issuances ci ON ci.id = cr.certificate_id
            INNER JOIN residents r ON r.id = cr.resident_id
            WHERE 1=1
        ";
        $params = [];

        if ($residentId > 0) {
            $sql .= " AND cr.resident_id = ?";
            $params[] = $residentId;
        }

        if ($status) {
            $sql .= " AND cr.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY cr.created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

        response(true, "Requests retrieved successfully.", $requests);
    }

    // =================================================
    // POST — Create request (resident)
    // =================================================

    if ($method === "POST") {

        $data = getJsonInput();

        $certificateId = isset($data["certificate_id"]) ? (int)$data["certificate_id"] : 0;
        $residentId = isset($data["resident_id"]) ? (int)$data["resident_id"] : 0;
        $fieldValues = $data["field_values"] ?? [];

        if ($certificateId <= 0) {
            response(false, "Certificate is required.", null, 422);
        }
        if ($residentId <= 0) {
            response(false, "Resident is required.", null, 422);
        }

        // --- Verify certificate ---
        $stmt = $pdo->prepare("
            SELECT id, name, certificate_fee, is_published
            FROM certificate_issuances
            WHERE id = ? LIMIT 1
        ");
        $stmt->execute([$certificateId]);
        $certificate = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$certificate) {
            response(false, "Certificate not found.", null, 404);
        }

        if ((int)$certificate["is_published"] !== 1) {
            response(false, "Certificate is not available.", null, 422);
        }

        // --- Verify resident ---
        $stmt = $pdo->prepare("SELECT id FROM residents WHERE id = ? LIMIT 1");
        $stmt->execute([$residentId]);
        if (!$stmt->fetch()) {
            response(false, "Resident not found.", null, 404);
        }

        // --- Validate required fields ---
        $stmt = $pdo->prepare("
            SELECT field_label, is_required
            FROM certificate_form_fields
            WHERE certificate_id = ? AND is_required = 1
        ");
        $stmt->execute([$certificateId]);
        $requiredFields = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($requiredFields as $field) {
            $key = $field["field_label"];
            if (empty($fieldValues[$key])) {
                response(false, "Field '{$key}' is required.", null, 422);
            }
        }

        // --- Generate reference no ---
        $referenceNo = generateReferenceNo($pdo);

        // --- Insert ---
        $stmt = $pdo->prepare("
            INSERT INTO certificate_requests (
                reference_no,
                certificate_id,
                resident_id,
                field_values,
                status,
                payment_status
            )
            VALUES (?, ?, ?, ?, 'Pending', 'Unpaid')
        ");
        $stmt->execute([
            $referenceNo,
            $certificateId,
            $residentId,
            json_encode($fieldValues)
        ]);

        $newId = $pdo->lastInsertId();

        // --- Fetch created ---
        $stmt = $pdo->prepare("
            SELECT cr.*, ci.name AS certificate_name
            FROM certificate_requests cr
            INNER JOIN certificate_issuances ci ON ci.id = cr.certificate_id
            WHERE cr.id = ?
        ");
        $stmt->execute([$newId]);
        $created = $stmt->fetch(PDO::FETCH_ASSOC);
        $created["field_values"] = json_decode($created["field_values"], true);

        response(true, "Request submitted successfully.", $created, 201);
    }

    // =================================================
    // PUT — Update request (admin)
    // =================================================

    if ($method === "PUT") {

        $data = getJsonInput();
        $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

        if ($id <= 0) {
            response(false, "Invalid request ID.", null, 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM certificate_requests WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            response(false, "Request not found.", null, 404);
        }

        // --- Allowed values ---
        $allowedStatus = ["Pending", "Processing", "Released", "Rejected"];
        $allowedPayment = ["Paid", "Unpaid", "Waived"];

        $status = clean($data["status"] ?? $existing["status"]);
        if (!in_array($status, $allowedStatus, true)) {
            response(false, "Invalid status.", null, 422);
        }

        $paymentStatus = clean($data["payment_status"] ?? $existing["payment_status"]);
        if (!in_array($paymentStatus, $allowedPayment, true)) {
            response(false, "Invalid payment status.", null, 422);
        }

        $remarks = clean($data["remarks"] ?? $existing["remarks"]);
        $pdfPath = clean($data["pdf_path"] ?? $existing["pdf_path"]);

        // --- Update ---
        $stmt = $pdo->prepare("
            UPDATE certificate_requests
            SET status = ?, payment_status = ?, remarks = ?, pdf_path = ?
            WHERE id = ?
        ");
        $stmt->execute([$status, $paymentStatus, $remarks, $pdfPath, $id]);

        // --- Fetch updated ---
        $stmt = $pdo->prepare("
            SELECT cr.*, ci.name AS certificate_name
            FROM certificate_requests cr
            INNER JOIN certificate_issuances ci ON ci.id = cr.certificate_id
            WHERE cr.id = ?
        ");
        $stmt->execute([$id]);
        $updated = $stmt->fetch(PDO::FETCH_ASSOC);
        $updated["field_values"] = json_decode($updated["field_values"], true);

        response(true, "Request updated successfully.", $updated);
    }

    // =================================================
    // DELETE — Cancel request
    // =================================================

    if ($method === "DELETE") {

        $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

        if ($id <= 0) {
            response(false, "Invalid request ID.", null, 400);
        }

        $stmt = $pdo->prepare("SELECT id, status FROM certificate_requests WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            response(false, "Request not found.", null, 404);
        }

        if ($existing["status"] === "Released") {
            response(false, "Released requests cannot be deleted.", null, 422);
        }

        $stmt = $pdo->prepare("DELETE FROM certificate_requests WHERE id = ?");
        $stmt->execute([$id]);

        response(true, "Request deleted successfully.", ["id" => $id]);
    }

    // =================================================
    // METHOD NOT ALLOWED
    // =================================================

    response(false, "Method not allowed.", null, 405);

} catch (PDOException $e) {
    error_log("Certificate Requests PDO Error: " . $e->getMessage());
    response(false, "A database error occurred.", null, 500);
} catch (Throwable $e) {
    error_log("Certificate Requests Error: " . $e->getMessage());
    response(false, "An unexpected server error occurred.", null, 500);
}

?>