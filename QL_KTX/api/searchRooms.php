<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

// Nhận dữ liệu từ request
$building = isset($_GET['building']) ? trim($_GET['building']) : '';
$room_number = isset($_GET['roomNumber']) ? trim($_GET['roomNumber']) : '';
$min_capacity = isset($_GET['min_capacity']) ? (int)$_GET['min_capacity'] : 0;
$max_capacity = isset($_GET['max_capacity']) ? (int)$_GET['max_capacity'] : 6;
$status = isset($_GET['status']) ? trim($_GET['status']) : '';

// Tạo truy vấn SQL động
$sql = "SELECT * FROM room WHERE capacity BETWEEN ? AND ?";
$params = [$min_capacity, $max_capacity];

if (!empty($building)) {
    $sql .= " AND building = ?";
    $params[] = $building;
}

if (!empty($room_number)) {
    $sql .= " AND room_number = ?";
    $params[] = $room_number;
}

if (!empty($status)) {
    $sql .= " AND status = ?";
    $params[] = $status;
}

$stmt = $conn->prepare($sql);
$stmt->execute($params);
$rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($rooms);
?>
