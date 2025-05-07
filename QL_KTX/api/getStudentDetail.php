<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

$student_id = isset($_GET['student_id']) ? $_GET['student_id'] : null;

if (!$student_id) {
    echo json_encode(["error" => "Missing student ID"]);
    exit;
}

$sql = "SELECT s.*, c.start_date, c.end_date,
               CASE 
                   WHEN c.end_date >= CURDATE() THEN 'Hiệu lực'
                   WHEN c.end_date < CURDATE() THEN 'Hết hạn'
                   ELSE NULL 
               END AS contract_status
        FROM student s
        LEFT JOIN contract c ON s.student_id = c.student_id
        WHERE s.student_id = ?";

$stmt = $conn->prepare($sql);
$stmt->execute([$student_id]);
$student = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode($student);
?>