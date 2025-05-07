<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

$sql = "SELECT al.*, s.full_name, s.room_number, s.building, a.username as admin_name
        FROM activity_log al
        LEFT JOIN student s ON al.record_id = s.student_id
        LEFT JOIN admin a ON al.admin_id = a.admin_id
        WHERE al.module IN ('student', 'contract')
        ORDER BY al.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->execute();
$history = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($history);
?>