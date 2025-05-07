<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

$room_id = $_GET['room_id'];
$stmt = $conn->prepare("SELECT room_id, building, room_number, capacity, current_occupancy, status, price FROM room WHERE room_id = ?");
$stmt->execute([$room_id]);
$room = $stmt->fetch(PDO::FETCH_ASSOC);

if ($room) {
    echo json_encode($room);
} else {
    echo json_encode(["error" => true, "message" => "Phòng không tồn tại."]);
}
?>
