<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

// Nhận dữ liệu tìm kiếm từ request
$building = isset($_GET['building']) ? $_GET['building'] : '';
$room_number = isset($_GET['room_number']) ? $_GET['room_number'] : '';
$status = isset($_GET['status']) ? $_GET['status'] : '';

// Tạo câu truy vấn SQL động
$sql = "SELECT * FROM room WHERE 1=1";
$params = [];

if (!empty($building)) {
    $sql .= " AND building LIKE ?";
    $params[] = "%$building%";
}

if (!empty($room_number)) {
    $sql .= " AND room_number LIKE ?";
    $params[] = "%$room_number%";
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
