<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

$sql = "SELECT al.*, a.username as admin_name
        FROM activity_log al
        LEFT JOIN admin a ON al.admin_id = a.admin_id
        WHERE al.module IN ('payment', 'fee')
        ORDER BY al.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->execute();
$history = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($history);
?>