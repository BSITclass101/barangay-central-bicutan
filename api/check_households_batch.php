<?php
require_once "config.php";

$excludeHouseholdId = isset($_GET['exclude_household_id']) ? intval($_GET['exclude_household_id']) : null;

$residentIds = [];

// Heads
$sql = "SELECT head_resident_id FROM households WHERE head_resident_id IS NOT NULL AND head_resident_id != ''";
$params = [];
if ($excludeHouseholdId) {
    $sql .= " AND id != ?";
    $params[] = $excludeHouseholdId;
}
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
while ($row = $stmt->fetch()) {
    $residentIds[] = $row['head_resident_id'];
}

// Members
$sql = "SELECT hm.resident_id FROM household_members hm 
        JOIN households h ON hm.household_id = h.id 
        WHERE hm.resident_id IS NOT NULL AND hm.resident_id != ''";
$params = [];
if ($excludeHouseholdId) {
    $sql .= " AND h.id != ?";
    $params[] = $excludeHouseholdId;
}
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
while ($row = $stmt->fetch()) {
    $residentIds[] = $row['resident_id'];
}

respond([
    "in_household" => array_values(array_unique($residentIds))
]);
?>