<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

$studentName = isset($_GET['studentName']) ? $_GET['studentName'] : '';
$status = isset($_GET['status']) ? $_GET['status'] : '';
$room = isset($_GET['room']) ? $_GET['room'] : '';

// Get all students with their calculated status
$sql = "SELECT s.student_id, s.full_name, s.room_number, s.building, 
        i.total_amount as amount_due, i.issue_date, i.due_date,
        CASE 
            WHEN payment_status = 'Quá hạn' THEN 'Quá hạn'
            WHEN payment_status = 'Chưa thanh toán' THEN 'Chưa thanh toán'
            ELSE payment_status
        END as status
        FROM student s
        LEFT JOIN contract c ON s.student_id = c.student_id 
        LEFT JOIN invoice i ON c.contract_id = i.contract_id
        WHERE 1=1";

// Add filters
if ($studentName) {
    $sql .= " AND s.full_name LIKE :studentName";
}

if ($room) {
    $sql .= " AND s.room_number LIKE :room";
}

if ($status) {
    if ($status === 'Quá hạn') {
        $sql .= " AND payment_status = 'Quá hạn'";
    } elseif ($status === 'Chưa thanh toán') {
        $sql .= " AND payment_status = 'Chưa thanh toán'";
    } else {
        $sql .= " AND payment_status = :status";
    }
}

// Add ordering
$sql .= " ORDER BY 
        CASE 
            WHEN payment_status = 'Quá hạn' THEN 1
            WHEN payment_status = 'Chưa thanh toán' THEN 2
            ELSE 3
        END";

$stmt = $conn->prepare($sql);

if ($studentName) {
    $stmt->bindValue(':studentName', "%$studentName%", PDO::PARAM_STR);
}

if ($room) {
    $stmt->bindValue(':room', "%$room%", PDO::PARAM_STR);
}

if ($status && $status !== 'Quá hạn' && $status !== 'Chưa thanh toán') {
    $stmt->bindValue(':status', $status, PDO::PARAM_STR);
}

$stmt->execute();
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($result);
?>