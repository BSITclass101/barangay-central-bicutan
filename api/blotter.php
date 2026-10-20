<?php

// =====================================================
// CORS
// =====================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once "../config/db.php";

// =====================================================
// RESPONSE HELPER
// =====================================================
function response($success, $message = "", $data = null, $statusCode = 200)
{
    http_response_code($statusCode);
    echo json_encode([
        "success" => $success,
        "message" => $message,
        "data" => $data,
    ]);
    exit;
}

$method = $_SERVER["REQUEST_METHOD"];
$input = [];

if (in_array($method, ["POST", "PUT", "DELETE"])) {
    $rawInput = file_get_contents("php://input");
    if (!empty($rawInput)) {
        $input = json_decode($rawInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            response(false, "Invalid JSON request.", null, 400);
        }
    }
}

$allowedStatuses = ["Pending", "Resolved", "Under Investigation", "Dismissed"];

// =====================================================
// HELPERS
// =====================================================
function getResidentDbId($person)
{
    if (!is_array($person)) return null;
    if (isset($person["residentDbId"]) && $person["residentDbId"] !== "" && $person["residentDbId"] !== null) {
        return (int) $person["residentDbId"];
    }
    if (isset($person["residentId"]) && is_numeric($person["residentId"])) {
        return (int) $person["residentId"];
    }
    return null;
}

function validatePeople(PDO $pdo, $people, string $fieldName)
{
    if ($people === null) return [];
    if (!is_array($people)) response(false, "$fieldName must be an array.", null, 400);

    $residentIds = [];
    foreach ($people as $index => $person) {
        $residentDbId = getResidentDbId($person);
        if (!$residentDbId) {
            response(false, "$fieldName #" . ($index + 1) . " must have a valid resident selection.", null, 400);
        }
        if (in_array($residentDbId, $residentIds, true)) {
            response(false, "Duplicate resident found in $fieldName.", null, 400);
        }
        $residentIds[] = $residentDbId;
    }

    if (empty($residentIds)) return [];

    $placeholders = implode(",", array_fill(0, count($residentIds), "?"));
    $stmt = $pdo->prepare("SELECT id FROM residents WHERE id IN ($placeholders)");
    $stmt->execute($residentIds);
    $existingIds = array_map("intval", $stmt->fetchAll(PDO::FETCH_COLUMN));

    foreach ($residentIds as $residentId) {
        if (!in_array($residentId, $existingIds, true)) {
            response(false, "Resident ID $residentId does not exist in Residents Master Record.", null, 400);
        }
    }

    return $residentIds;
}

function insertPeople(PDO $pdo, string $table, int $blotterId, array $residentIds)
{
    if (empty($residentIds)) return;
    $stmt = $pdo->prepare("INSERT INTO $table (blotter_id, resident_id) VALUES (?, ?)");
    foreach ($residentIds as $residentId) {
        $stmt->execute([$blotterId, $residentId]);
    }
}

function getPeople(PDO $pdo, string $table, int $blotterId)
{
    $sql = "
        SELECT bp.id, bp.blotter_id, bp.resident_id,
            r.resident_id AS resident_code,
            r.first_name, r.middle_name, r.last_name, r.suffix
        FROM $table bp
        INNER JOIN residents r ON r.id = bp.resident_id
        WHERE bp.blotter_id = ?
        ORDER BY bp.id ASC
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$blotterId]);
    $rows = $stmt->fetchAll();

    $people = [];
    foreach ($rows as $row) {
        $nameParts = [];
        if (!empty($row["first_name"])) $nameParts[] = $row["first_name"];
        if (!empty($row["middle_name"])) $nameParts[] = $row["middle_name"];
        if (!empty($row["last_name"])) $nameParts[] = $row["last_name"];
        $name = implode(" ", $nameParts);
        if (!empty($row["suffix"])) $name .= " " . $row["suffix"];

        $people[] = [
            "id" => (int) $row["id"],
            "residentDbId" => (int) $row["resident_id"],
            "residentId" => $row["resident_code"],
            "name" => $name,
        ];
    }
    return $people;
}

function getBlotterRecord(PDO $pdo, int $blotterId)
{
    $sql = "
        SELECT id, record_number, date_reported, status, incident_type,
            incident_date, incident_time, incident_location,
            incident_description, action_taken, resolution, resolution_date,
            created_at, updated_at
        FROM blotter_records WHERE id = ? LIMIT 1
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$blotterId]);
    $record = $stmt->fetch();

    if (!$record) return null;

    $record["id"] = (int) $record["id"];
    $record["complainants"] = getPeople($pdo, "blotter_complainants", $blotterId);
    $record["victims"] = getPeople($pdo, "blotter_victims", $blotterId);
    $record["respondents"] = getPeople($pdo, "blotter_respondents", $blotterId);
    $record["witnesses"] = getPeople($pdo, "blotter_witnesses", $blotterId);

    return $record;
}

// =====================================================
// GET
// =====================================================
if ($method === "GET") {

    // 🔑 FILTER BY RESIDENT ID (para sa resident portal)
    if (isset($_GET["resident_id"]) && $_GET["resident_id"] !== "") {
        $residentId = (int) $_GET["resident_id"];

        if ($residentId <= 0) {
            response(false, "Invalid resident ID.", null, 400);
        }

        try {
            $sql = "
                SELECT DISTINCT br.id, br.record_number, br.date_reported,
                    br.status, br.incident_type, br.incident_date,
                    br.incident_time, br.incident_location,
                    br.incident_description, br.created_at, br.updated_at,
                    (SELECT COUNT(*) FROM blotter_complainants bc WHERE bc.blotter_id = br.id) AS complainant_count,
                    (SELECT COUNT(*) FROM blotter_victims bv WHERE bv.blotter_id = br.id) AS victim_count,
                    (SELECT COUNT(*) FROM blotter_respondents bres WHERE bres.blotter_id = br.id) AS respondent_count,
                    (SELECT COUNT(*) FROM blotter_witnesses bw WHERE bw.blotter_id = br.id) AS witness_count
                FROM blotter_records br
                WHERE br.id IN (
                    SELECT blotter_id FROM blotter_complainants WHERE resident_id = ?
                    UNION
                    SELECT blotter_id FROM blotter_victims WHERE resident_id = ?
                    UNION
                    SELECT blotter_id FROM blotter_respondents WHERE resident_id = ?
                    UNION
                    SELECT blotter_id FROM blotter_witnesses WHERE resident_id = ?
                )
                ORDER BY br.id DESC
            ";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([$residentId, $residentId, $residentId, $residentId]);
            $records = $stmt->fetchAll();

            foreach ($records as &$record) {
                $record["id"] = (int) $record["id"];
                $record["complainant_count"] = (int) $record["complainant_count"];
                $record["victim_count"] = (int) $record["victim_count"];
                $record["respondent_count"] = (int) $record["respondent_count"];
                $record["witness_count"] = (int) $record["witness_count"];
            }
            unset($record);

            response(true, "Blotter records retrieved successfully.", $records);
        } catch (Throwable $e) {
            error_log("BLOTTER RESIDENT FILTER ERROR: " . $e->getMessage());
            response(false, "Failed to retrieve records: " . $e->getMessage(), null, 500);
        }
    }

    // GET SINGLE RECORD
    if (isset($_GET["id"]) && $_GET["id"] !== "") {
        $id = (int) $_GET["id"];
        if ($id <= 0) response(false, "Invalid blotter ID.", null, 400);

        $record = getBlotterRecord($pdo, $id);
        if (!$record) response(false, "Blotter record not found.", null, 404);

        response(true, "Blotter record retrieved successfully.", $record);
    }

    // GET ALL
    $search = isset($_GET["search"]) ? trim($_GET["search"]) : "";
    $status = isset($_GET["status"]) ? trim($_GET["status"]) : "";
    $where = [];
    $params = [];

    if ($search !== "") {
        $where[] = "(br.record_number LIKE ? OR br.incident_type LIKE ? OR br.incident_location LIKE ?)";
        $searchValue = "%" . $search . "%";
        $params[] = $searchValue;
        $params[] = $searchValue;
        $params[] = $searchValue;
    }

    if ($status !== "" && in_array($status, $allowedStatuses, true)) {
        $where[] = "br.status = ?";
        $params[] = $status;
    }

    $sql = "
        SELECT br.id, br.record_number, br.date_reported, br.status,
            br.incident_type, br.incident_date, br.incident_time,
            br.incident_location, br.incident_description,
            br.created_at, br.updated_at,
            (SELECT COUNT(*) FROM blotter_complainants bc WHERE bc.blotter_id = br.id) AS complainant_count,
            (SELECT COUNT(*) FROM blotter_victims bv WHERE bv.blotter_id = br.id) AS victim_count,
            (SELECT COUNT(*) FROM blotter_respondents bres WHERE bres.blotter_id = br.id) AS respondent_count,
            (SELECT COUNT(*) FROM blotter_witnesses bw WHERE bw.blotter_id = br.id) AS witness_count
        FROM blotter_records br
    ";

    if (!empty($where)) $sql .= " WHERE " . implode(" AND ", $where);
    $sql .= " ORDER BY br.id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $records = $stmt->fetchAll();

    foreach ($records as &$record) {
        $record["id"] = (int) $record["id"];
        $record["complainant_count"] = (int) $record["complainant_count"];
        $record["victim_count"] = (int) $record["victim_count"];
        $record["respondent_count"] = (int) $record["respondent_count"];
        $record["witness_count"] = (int) $record["witness_count"];
    }
    unset($record);

    response(true, "Blotter records retrieved successfully.", $records);
}

// =====================================================
// POST
// =====================================================
if ($method === "POST") {
    $dateReported = $input["dateReported"] ?? null;
    $status = $input["status"] ?? "Pending";
    $incidentType = trim($input["incidentType"] ?? "");
    $incidentDate = $input["incidentDate"] ?? null;
    $incidentTime = $input["incidentTime"] ?? null;
    $incidentLocation = trim($input["incidentLocation"] ?? "");
    $incidentDescription = trim($input["incidentDescription"] ?? "");
    $actionTaken = trim($input["actionTaken"] ?? "");
    $resolution = trim($input["resolution"] ?? "");
    $resolutionDate = $input["resolutionDate"] ?? null;

    if (!$dateReported) response(false, "Date reported is required.", null, 400);
    if (!$incidentType) response(false, "Incident type is required.", null, 400);
    if (!$incidentDate) response(false, "Incident date is required.", null, 400);
    if (!in_array($status, $allowedStatuses, true)) response(false, "Invalid blotter status.", null, 400);

    $complainants = validatePeople($pdo, $input["complainants"] ?? [], "Complainants");
    $victims = validatePeople($pdo, $input["victims"] ?? [], "Victims");
    $respondents = validatePeople($pdo, $input["respondents"] ?? [], "Respondents");
    $witnesses = validatePeople($pdo, $input["witnesses"] ?? [], "Witnesses");

    $complainantVictimIds = array_unique(array_merge($complainants, $victims));
    foreach ($respondents as $respondentId) {
        if (in_array($respondentId, $complainantVictimIds, true)) {
            response(false, "A complainant or victim cannot also be a respondent.", null, 400);
        }
    }

    try {
        $pdo->beginTransaction();

        $temporaryRecordNumber = "TEMP-" . date("YmdHis") . "-" . uniqid();

        $sql = "
            INSERT INTO blotter_records
            (record_number, date_reported, status, incident_type, incident_date,
            incident_time, incident_location, incident_description,
            action_taken, resolution, resolution_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $temporaryRecordNumber, $dateReported, $status, $incidentType,
            $incidentDate, $incidentTime ?: null, $incidentLocation ?: null,
            $incidentDescription ?: null, $actionTaken ?: null,
            $resolution ?: null, $resolutionDate ?: null,
        ]);

        $blotterId = (int) $pdo->lastInsertId();
        $recordNumber = "BLT-" . date("Y") . "-" . str_pad($blotterId, 4, "0", STR_PAD_LEFT);

        $stmt = $pdo->prepare("UPDATE blotter_records SET record_number = ? WHERE id = ?");
        $stmt->execute([$recordNumber, $blotterId]);

        insertPeople($pdo, "blotter_complainants", $blotterId, $complainants);
        insertPeople($pdo, "blotter_victims", $blotterId, $victims);
        insertPeople($pdo, "blotter_respondents", $blotterId, $respondents);
        insertPeople($pdo, "blotter_witnesses", $blotterId, $witnesses);

        $pdo->commit();

        $record = getBlotterRecord($pdo, $blotterId);
        response(true, "Blotter record saved successfully.", $record, 201);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log("BLOTTER POST ERROR: " . $e->getMessage());
        response(false, "Failed to save blotter record.", null, 500);
    }
}

// =====================================================
// PUT
// =====================================================
if ($method === "PUT") {
    $blotterId = isset($input["id"]) ? (int) $input["id"]
        : (isset($input["blotter_id"]) ? (int) $input["blotter_id"]
        : (isset($_GET["id"]) ? (int) $_GET["id"] : 0));

    if ($blotterId <= 0) response(false, "Blotter ID is required.", null, 400);

    $existing = getBlotterRecord($pdo, $blotterId);
    if (!$existing) response(false, "Blotter record not found.", null, 404);

    $isStatusOnlyUpdate = isset($input["status"]) &&
        !isset($input["dateReported"]) && !isset($input["incidentType"]) &&
        !isset($input["incidentDate"]) && !isset($input["complainants"]) &&
        !isset($input["victims"]) && !isset($input["respondents"]) &&
        !isset($input["witnesses"]);

    if ($isStatusOnlyUpdate) {
        $status = $input["status"];
        if (!in_array($status, $allowedStatuses, true)) {
            response(false, "Invalid blotter status.", null, 400);
        }

        try {
            $stmt = $pdo->prepare("UPDATE blotter_records SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$status, $blotterId]);
            $record = getBlotterRecord($pdo, $blotterId);
            response(true, "Blotter status updated successfully.", $record);
        } catch (Throwable $e) {
            error_log("BLOTTER STATUS UPDATE ERROR: " . $e->getMessage());
            response(false, "Failed to update blotter status.", null, 500);
        }
    }

    $dateReported = $input["dateReported"] ?? $existing["date_reported"];
    $status = $input["status"] ?? $existing["status"];
    $incidentType = trim($input["incidentType"] ?? $existing["incident_type"]);
    $incidentDate = $input["incidentDate"] ?? $existing["incident_date"];
    $incidentTime = $input["incidentTime"] ?? $existing["incident_time"];
    $incidentLocation = trim($input["incidentLocation"] ?? ($existing["incident_location"] ?? ""));
    $incidentDescription = trim($input["incidentDescription"] ?? ($existing["incident_description"] ?? ""));
    $actionTaken = trim($input["actionTaken"] ?? ($existing["action_taken"] ?? ""));
    $resolution = trim($input["resolution"] ?? ($existing["resolution"] ?? ""));
    $resolutionDate = $input["resolutionDate"] ?? $existing["resolution_date"];

    if (!in_array($status, $allowedStatuses, true)) response(false, "Invalid blotter status.", null, 400);
    if (!$dateReported) response(false, "Date reported is required.", null, 400);
    if (!$incidentType) response(false, "Incident type is required.", null, 400);
    if (!$incidentDate) response(false, "Incident date is required.", null, 400);

    $complainants = array_key_exists("complainants", $input)
        ? validatePeople($pdo, $input["complainants"], "Complainants")
        : array_map(fn($p) => (int) $p["residentDbId"], $existing["complainants"]);

    $victims = array_key_exists("victims", $input)
        ? validatePeople($pdo, $input["victims"], "Victims")
        : array_map(fn($p) => (int) $p["residentDbId"], $existing["victims"]);

    $respondents = array_key_exists("respondents", $input)
        ? validatePeople($pdo, $input["respondents"], "Respondents")
        : array_map(fn($p) => (int) $p["residentDbId"], $existing["respondents"]);

    $witnesses = array_key_exists("witnesses", $input)
        ? validatePeople($pdo, $input["witnesses"], "Witnesses")
        : array_map(fn($p) => (int) $p["residentDbId"], $existing["witnesses"]);

    $complainantVictimIds = array_unique(array_merge($complainants, $victims));
    foreach ($respondents as $respondentId) {
        if (in_array($respondentId, $complainantVictimIds, true)) {
            response(false, "A complainant or victim cannot also be a respondent.", null, 400);
        }
    }

    try {
        $pdo->beginTransaction();

        $sql = "
            UPDATE blotter_records
            SET date_reported = ?, status = ?, incident_type = ?,
                incident_date = ?, incident_time = ?, incident_location = ?,
                incident_description = ?, action_taken = ?, resolution = ?,
                resolution_date = ?
            WHERE id = ?
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $dateReported, $status, $incidentType, $incidentDate,
            $incidentTime ?: null, $incidentLocation ?: null,
            $incidentDescription ?: null, $actionTaken ?: null,
            $resolution ?: null, $resolutionDate ?: null, $blotterId,
        ]);

        $tables = ["blotter_complainants", "blotter_victims", "blotter_respondents", "blotter_witnesses"];
        foreach ($tables as $table) {
            $stmt = $pdo->prepare("DELETE FROM $table WHERE blotter_id = ?");
            $stmt->execute([$blotterId]);
        }

        insertPeople($pdo, "blotter_complainants", $blotterId, $complainants);
        insertPeople($pdo, "blotter_victims", $blotterId, $victims);
        insertPeople($pdo, "blotter_respondents", $blotterId, $respondents);
        insertPeople($pdo, "blotter_witnesses", $blotterId, $witnesses);

        $pdo->commit();

        $record = getBlotterRecord($pdo, $blotterId);
        response(true, "Blotter record updated successfully.", $record);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log("BLOTTER PUT ERROR: " . $e->getMessage());
        response(false, "Failed to update blotter record.", null, 500);
    }
}

// =====================================================
// DELETE
// =====================================================
if ($method === "DELETE") {
    $blotterId = isset($input["id"]) ? (int) $input["id"]
        : (isset($input["blotter_id"]) ? (int) $input["blotter_id"]
        : (isset($_GET["id"]) ? (int) $_GET["id"] : 0));

    if ($blotterId <= 0) response(false, "Blotter ID is required.", null, 400);

    $existing = getBlotterRecord($pdo, $blotterId);
    if (!$existing) response(false, "Blotter record not found.", null, 404);

    try {
        $stmt = $pdo->prepare("DELETE FROM blotter_records WHERE id = ?");
        $stmt->execute([$blotterId]);
        response(true, "Blotter record deleted successfully.", ["id" => $blotterId]);
    } catch (Throwable $e) {
        error_log("BLOTTER DELETE ERROR: " . $e->getMessage());
        response(false, "Failed to delete blotter record.", null, 500);
    }
}

response(false, "Method not allowed.", null, 405);
?>