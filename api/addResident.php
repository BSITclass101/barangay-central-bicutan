<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

include "../config/db.php";

// DEBUG - Tingnan kung may natatanggap na JSON
$raw = file_get_contents("php://input");

if (empty($raw)) {
    echo json_encode([
        "success" => false,
        "message" => "No raw data received"
    ]);
    exit();
}

$data = json_decode($raw);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON",
        "raw" => $raw
    ]);
    exit();
}

$first_name = $data->first_name;
$middle_name = $data->middle_name;
$last_name = $data->last_name;
$gender = $data->gender;
$age = $data->age;
$address = $data->address;
$contact_number = $data->contact_number;
$civil_status = $data->civil_status;
$citizenship = $data->citizenship;

$sql = "INSERT INTO residents
(first_name, middle_name, last_name, gender, age, address, contact_number, civil_status, citizenship)
VALUES
('$first_name', '$middle_name', '$last_name', '$gender', '$age', '$address', '$contact_number', '$civil_status', '$citizenship')";

if ($conn->query($sql)) {

    echo json_encode([
        "success" => true,
        "message" => "Resident added successfully"
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => $conn->error
    ]);

}

$conn->close();

?>