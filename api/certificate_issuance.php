<?php

// =====================================================
// CERTIFICATE ISSUANCE API
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
// GENERATE CERTIFICATE NUMBER
// =====================================================

function generateCertificateNumber($pdo) {
    do {
        $number = random_int(100000, 999999);
        $certificateNo = "CERT-" . date("Y") . "-" . $number;

        $stmt = $pdo->prepare("
            SELECT id FROM certificate_issuances
            WHERE certificate_no = ?
            LIMIT 1
        ");
        $stmt->execute([$certificateNo]);
        $exists = $stmt->fetch(PDO::FETCH_ASSOC);
    } while ($exists);

    return $certificateNo;
}

// =====================================================
// ALLOWED VALUES
// =====================================================

$allowedCertificateTypes = [
    "Barangay Clearance",
    "Certificate of Indigency",
    "Certificate of Residency",
    "Business Permit",
    "Barangay ID",
    "Barangay Permit",
    "Health Services",
    "Social Welfare"
];

$allowedPaymentStatus = ["Unpaid", "Paid", "Waived"];

$allowedStatus = [
    "Pending",
    "Verified",
    "For Payment",
    "Paid",
    "For Signature",
    "Released",
    "Rejected",
    "Cancelled"
];

// =====================================================
// METHOD
// =====================================================

$method = $_SERVER["REQUEST_METHOD"];

try {

    // =================================================
    // GET
    // =================================================

    if ($method === "GET") {

        // =================================================
        // GET PUBLISHED TEMPLATES (para sa resident dropdown)
        // =================================================
        if (isset($_GET["published"]) && $_GET["published"] === "1") {
            $stmt = $pdo->prepare("
                SELECT
                    id,
                    name,
                    certificate_fee,
                    header_text,
                    subheader_text,
                    barangay_text,
                    footer_text,
                    template_layout,
                    is_published,
                    is_available_online
                FROM certificate_issuances
                WHERE is_template = 1
                  AND is_published = 1
                  AND is_available_online = 1
                ORDER BY name ASC
            ");
            $stmt->execute();
            $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($templates as &$t) {
                if (!empty($t["template_layout"])) {
                    $t["template_layout"] = json_decode($t["template_layout"], true);
                }
            }

            response(true, "Published templates retrieved successfully.", $templates);
        }

        // =================================================
        // GET ALL CERTIFICATES (existing)
        // =================================================
        $sql = "
            SELECT
                c.id,
                c.certificate_no,
                c.resident_id,
                c.resident_code,
                c.certificate_type,
                c.purpose,
                c.amount,
                c.payment_status,
                c.or_number,
                c.status,
                c.issued_date,
                c.issued_by,
                c.remarks,
                c.created_at,
                c.updated_at,
                c.header_text,
                c.subheader_text,
                c.barangay_text,
                c.footer_text,
                c.template_layout,
                c.is_template,
                c.is_available_online,
                c.name,
                c.certificate_fee,
                c.is_published,
                c.pdf_path,
                CONCAT(
                    r.first_name, ' ',
                    IFNULL(CONCAT(r.middle_name, ' '), ''),
                    r.last_name,
                    IFNULL(CONCAT(' ', r.suffix), '')
                ) AS resident_name,
                r.first_name,
                r.middle_name,
                r.last_name,
                r.suffix,
                r.sex,
                r.date_of_birth,
                r.civil_status,
                r.mobile_number,
                r.email_address,
                r.house_number,
                r.street,
                r.purok,
                r.barangay,
                r.city,
                r.province
            FROM certificate_issuances c
            LEFT JOIN residents r ON r.id = c.resident_id
            ORDER BY c.created_at DESC
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $certificates = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($certificates as &$cert) {
            if (!empty($cert["template_layout"])) {
                $cert["template_layout"] = json_decode($cert["template_layout"], true);
            }
        }

        response(true, "Certificates retrieved successfully.", $certificates);
    }

    // =================================================
    // POST — CREATE
    // =================================================

    if ($method === "POST") {

        $data = getJsonInput();

        // =================================================
        // TEMPLATE MODE
        // =================================================

        $isTemplate = isset($data["is_template"]) ? (int)$data["is_template"] : 0;

        if ($isTemplate === 1) {
            $name = clean($data["name"] ?? null);
            if (!$name) {
                response(false, "Template name is required.", null, 422);
            }

            $certificateFee = isset($data["certificate_fee"]) ? (float)$data["certificate_fee"] : 0;
            $isPublished = isset($data["is_published"]) ? (int)$data["is_published"] : 0;
            $isAvailableOnline = isset($data["is_available_online"]) ? (int)$data["is_available_online"] : 1;

            $headerText = clean($data["header_text"] ?? "REPUBLIC OF THE PHILIPPINES");
            $subheaderText = clean($data["subheader_text"] ?? "CITY OF TAGUIG");
            $barangayText = clean($data["barangay_text"] ?? "BARANGAY CENTRAL BICUTAN");
            $footerText = clean($data["footer_text"] ?? "Barangay Captain");

            $templateLayout = null;
            if (isset($data["template_layout"]) && is_array($data["template_layout"])) {
                $templateLayout = json_encode($data["template_layout"]);
            } elseif (isset($data["template_layout"]) && is_string($data["template_layout"])) {
                $templateLayout = $data["template_layout"];
            }

            $certificateNo = generateCertificateNumber($pdo);

            $certificateType = $name;
            $purpose = "TEMPLATE DEFINITION";
            $amount = $certificateFee;
            $paymentStatus = "Unpaid";
            $orNumber = null;
            $status = "Pending";
            $issuedDate = date("Y-m-d");
            $issuedBy = "SYSTEM";
            $remarks = "Auto-generated template record";

            $sql = "
                INSERT INTO certificate_issuances (
                    certificate_no,
                    certificate_type,
                    purpose,
                    amount,
                    payment_status,
                    or_number,
                    status,
                    issued_date,
                    issued_by,
                    remarks,
                    name,
                    certificate_fee,
                    is_published,
                    is_available_online,
                    is_template,
                    header_text,
                    subheader_text,
                    barangay_text,
                    footer_text,
                    template_layout
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $certificateNo,
                $certificateType,
                $purpose,
                $amount,
                $paymentStatus,
                $orNumber,
                $status,
                $issuedDate,
                $issuedBy,
                $remarks,
                $name,
                $certificateFee,
                $isPublished,
                $isAvailableOnline,
                1,
                $headerText,
                $subheaderText,
                $barangayText,
                $footerText,
                $templateLayout
            ]);

            $newId = $pdo->lastInsertId();

            $stmt = $pdo->prepare("
                SELECT * FROM certificate_issuances WHERE id = ? LIMIT 1
            ");
            $stmt->execute([$newId]);
            $created = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($created && !empty($created["template_layout"])) {
                $created["template_layout"] = json_decode($created["template_layout"], true);
            }

            response(true, "Template created successfully.", $created, 201);
        }

        // =================================================
        // REGULAR ISSUANCE MODE (walk-in)
        // =================================================

        $residentId = isset($data["resident_id"]) ? (int)$data["resident_id"] : 0;
        if ($residentId <= 0) {
            response(false, "Resident is required.", null, 422);
        }

        $stmt = $pdo->prepare("SELECT id, resident_id FROM residents WHERE id = ? LIMIT 1");
        $stmt->execute([$residentId]);
        $resident = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$resident) {
            response(false, "Resident not found.", null, 404);
        }

        $residentCode = $resident["resident_id"];

        $certificateType = clean($data["certificate_type"] ?? null);
        if (!$certificateType) {
            response(false, "Certificate type is required.", null, 422);
        }

        $purpose = clean($data["purpose"] ?? null);
        if (!$purpose) {
            response(false, "Purpose is required.", null, 422);
        }

        $amount = isset($data["amount"]) ? (float)$data["amount"] : 0;
        if ($amount < 0) {
            response(false, "Amount cannot be negative.", null, 422);
        }

        $paymentStatus = clean($data["payment_status"] ?? "Unpaid");
        if (!in_array($paymentStatus, $allowedPaymentStatus, true)) {
            response(false, "Invalid payment status.", null, 422);
        }

        $orNumber = clean($data["or_number"] ?? null);
        if ($paymentStatus === "Paid" && !$orNumber) {
            response(false, "OR number is required when payment status is Paid.", null, 422);
        }

        $status = clean($data["status"] ?? "Pending");
        if (!in_array($status, $allowedStatus, true)) {
            response(false, "Invalid certificate status.", null, 422);
        }

        $issuedDate = clean($data["issued_date"] ?? date("Y-m-d"));
        $issuedBy = clean($data["issued_by"] ?? null);
        $remarks = clean($data["remarks"] ?? null);

        $headerText = clean($data["header_text"] ?? "REPUBLIC OF THE PHILIPPINES");
        $subheaderText = clean($data["subheader_text"] ?? "CITY OF TAGUIG");
        $barangayText = clean($data["barangay_text"] ?? "BARANGAY CENTRAL BICUTAN");
        $footerText = clean($data["footer_text"] ?? "Barangay Captain");

        $templateLayout = null;
        if (isset($data["template_layout"]) && is_array($data["template_layout"])) {
            $templateLayout = json_encode($data["template_layout"]);
        } elseif (isset($data["template_layout"]) && is_string($data["template_layout"])) {
            $templateLayout = $data["template_layout"];
        }

        $certificateNo = generateCertificateNumber($pdo);

        $sql = "
            INSERT INTO certificate_issuances (
                certificate_no,
                resident_id,
                resident_code,
                certificate_type,
                purpose,
                amount,
                payment_status,
                or_number,
                status,
                issued_date,
                issued_by,
                remarks,
                header_text,
                subheader_text,
                barangay_text,
                footer_text,
                template_layout
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $certificateNo,
            $residentId,
            $residentCode,
            $certificateType,
            $purpose,
            $amount,
            $paymentStatus,
            $orNumber,
            $status,
            $issuedDate,
            $issuedBy,
            $remarks,
            $headerText,
            $subheaderText,
            $barangayText,
            $footerText,
            $templateLayout
        ]);

        $newId = $pdo->lastInsertId();

        $stmt = $pdo->prepare("
            SELECT
                c.*,
                CONCAT(
                    r.first_name, ' ',
                    IFNULL(CONCAT(r.middle_name, ' '), ''),
                    r.last_name,
                    IFNULL(CONCAT(' ', r.suffix), '')
                ) AS resident_name
            FROM certificate_issuances c
            INNER JOIN residents r ON r.id = c.resident_id
            WHERE c.id = ?
            LIMIT 1
        ");
        $stmt->execute([$newId]);
        $created = $stmt->fetch(PDO::FETCH_ASSOC);

        response(true, "Certificate request created successfully.", $created, 201);
    }

    // =================================================
    // PUT — UPDATE
    // =================================================

    if ($method === "PUT") {

        $data = getJsonInput();
        $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

        if ($id <= 0) {
            response(false, "Invalid certificate ID.", null, 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM certificate_issuances WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            response(false, "Certificate not found.", null, 404);
        }

        $isTemplate = isset($data["is_template"]) ? (int)$data["is_template"] : (int)$existing["is_template"];

        if ($isTemplate === 1) {
            $name = clean($data["name"] ?? $existing["name"]);
            $certificateFee = isset($data["certificate_fee"]) ? (float)$data["certificate_fee"] : (float)$existing["certificate_fee"];
            $isPublished = isset($data["is_published"]) ? (int)$data["is_published"] : (int)$existing["is_published"];
            $isAvailableOnline = isset($data["is_available_online"]) ? (int)$data["is_available_online"] : (int)$existing["is_available_online"];

            $headerText = clean($data["header_text"] ?? $existing["header_text"]);
            $subheaderText = clean($data["subheader_text"] ?? $existing["subheader_text"]);
            $barangayText = clean($data["barangay_text"] ?? $existing["barangay_text"]);
            $footerText = clean($data["footer_text"] ?? $existing["footer_text"]);

            $templateLayout = $existing["template_layout"];
            if (isset($data["template_layout"]) && is_array($data["template_layout"])) {
                $templateLayout = json_encode($data["template_layout"]);
            } elseif (isset($data["template_layout"]) && is_string($data["template_layout"])) {
                $templateLayout = $data["template_layout"];
            }

            $sql = "
                UPDATE certificate_issuances
                SET
                    name = ?,
                    certificate_fee = ?,
                    is_published = ?,
                    is_available_online = ?,
                    header_text = ?,
                    subheader_text = ?,
                    barangay_text = ?,
                    footer_text = ?,
                    template_layout = ?
                WHERE id = ?
            ";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $name,
                $certificateFee,
                $isPublished,
                $isAvailableOnline,
                $headerText,
                $subheaderText,
                $barangayText,
                $footerText,
                $templateLayout,
                $id
            ]);

            $stmt = $pdo->prepare("SELECT * FROM certificate_issuances WHERE id = ? LIMIT 1");
            $stmt->execute([$id]);
            $updated = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($updated && !empty($updated["template_layout"])) {
                $updated["template_layout"] = json_decode($updated["template_layout"], true);
            }

            response(true, "Template updated successfully.", $updated);
        }

        $residentId = array_key_exists("resident_id", $data)
            ? (int)$data["resident_id"]
            : (int)$existing["resident_id"];

        if ($residentId <= 0) {
            response(false, "Resident is required.", null, 422);
        }

        $stmt = $pdo->prepare("SELECT id, resident_id FROM residents WHERE id = ? LIMIT 1");
        $stmt->execute([$residentId]);
        $resident = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$resident) {
            response(false, "Resident not found.", null, 404);
        }

        $residentCode = $resident["resident_id"];
        $certificateType = clean($data["certificate_type"] ?? $existing["certificate_type"]);
        $purpose = clean($data["purpose"] ?? $existing["purpose"]);
        $amount = array_key_exists("amount", $data) ? (float)$data["amount"] : (float)$existing["amount"];
        $paymentStatus = clean($data["payment_status"] ?? $existing["payment_status"]) ?: "Unpaid";
        $orNumber = clean($data["or_number"] ?? $existing["or_number"]);
        $status = clean($data["status"] ?? $existing["status"]) ?: "Pending";
        $issuedDate = clean($data["issued_date"] ?? $existing["issued_date"]) ?: date("Y-m-d");
        $issuedBy = clean($data["issued_by"] ?? $existing["issued_by"]);
        $remarks = clean($data["remarks"] ?? $existing["remarks"]);

        $headerText = clean($data["header_text"] ?? $existing["header_text"]);
        $subheaderText = clean($data["subheader_text"] ?? $existing["subheader_text"]);
        $barangayText = clean($data["barangay_text"] ?? $existing["barangay_text"]);
        $footerText = clean($data["footer_text"] ?? $existing["footer_text"]);

        $templateLayout = $existing["template_layout"];
        if (isset($data["template_layout"]) && is_array($data["template_layout"])) {
            $templateLayout = json_encode($data["template_layout"]);
        } elseif (isset($data["template_layout"]) && is_string($data["template_layout"])) {
            $templateLayout = $data["template_layout"];
        }

        $sql = "
            UPDATE certificate_issuances
            SET
                resident_id = ?,
                resident_code = ?,
                certificate_type = ?,
                purpose = ?,
                amount = ?,
                payment_status = ?,
                or_number = ?,
                status = ?,
                issued_date = ?,
                issued_by = ?,
                remarks = ?,
                header_text = ?,
                subheader_text = ?,
                barangay_text = ?,
                footer_text = ?,
                template_layout = ?
            WHERE id = ?
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $residentId,
            $residentCode,
            $certificateType,
            $purpose,
            $amount,
            $paymentStatus,
            $orNumber,
            $status,
            $issuedDate,
            $issuedBy,
            $remarks,
            $headerText,
            $subheaderText,
            $barangayText,
            $footerText,
            $templateLayout,
            $id
        ]);

        $stmt = $pdo->prepare("
            SELECT
                c.*,
                CONCAT(
                    r.first_name, ' ',
                    IFNULL(CONCAT(r.middle_name, ' '), ''),
                    r.last_name,
                    IFNULL(CONCAT(' ', r.suffix), '')
                ) AS resident_name
            FROM certificate_issuances c
            INNER JOIN residents r ON r.id = c.resident_id
            WHERE c.id = ?
            LIMIT 1
        ");
        $stmt->execute([$id]);
        $updated = $stmt->fetch(PDO::FETCH_ASSOC);

        response(true, "Certificate updated successfully.", $updated);
    }

    // =================================================
    // DELETE
    // =================================================

    if ($method === "DELETE") {

        $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

        if ($id <= 0) {
            response(false, "Invalid certificate ID.", null, 400);
        }

        $stmt = $pdo->prepare("
            SELECT id, certificate_no, status FROM certificate_issuances
            WHERE id = ? LIMIT 1
        ");
        $stmt->execute([$id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            response(false, "Certificate not found.", null, 404);
        }

        if ($existing["status"] === "Released") {
            response(false, "Released certificates cannot be deleted.", null, 422);
        }

        $stmt = $pdo->prepare("DELETE FROM certificate_issuances WHERE id = ?");
        $stmt->execute([$id]);

        response(true, "Certificate deleted successfully.", [
            "id" => $id,
            "certificate_no" => $existing["certificate_no"]
        ]);
    }

    // =================================================
    // METHOD NOT ALLOWED
    // =================================================

    response(false, "Method not allowed.", null, 405);

} catch (PDOException $e) {
    error_log("Certificate API PDO Error: " . $e->getMessage());
    response(false, "A database error occurred: " . $e->getMessage(), null, 500);
} catch (Throwable $e) {
    error_log("Certificate API Error: " . $e->getMessage());
    response(false, "An unexpected server error occurred: " . $e->getMessage(), null, 500);
}

?>