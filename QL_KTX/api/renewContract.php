<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();
$data = json_decode(file_get_contents("php://input"), true);

try {
    $conn->beginTransaction();
    
    // Get student details before renewal
    $stmt = $conn->prepare("SELECT full_name, building, room_number FROM student WHERE student_id = ?");
    $stmt->execute([$data['student_id']]);
    $studentDetails = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Cập nhật trạng thái và ngày hợp đồng
    $stmt = $conn->prepare("UPDATE contract SET status = 'Hiệu lực', start_date = CURRENT_DATE(), end_date = DATE_ADD(CURRENT_DATE(), INTERVAL 1 MONTH) WHERE student_id = ?");
    $stmt->execute([$data['student_id']]);

    // Ghi log
    $sql = "INSERT INTO activity_log (admin_id, action_type, module, record_id, description, created_at)
            VALUES (?, 'UPDATE', 'contract', ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $admin_id = isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1;
    $description = sprintf(
        "Gia hạn hợp đồng cho sinh viên %s (Phòng %s%s) - Thời hạn mới: %s đến %s",
        $studentDetails['full_name'],
        $studentDetails['building'],
        $studentDetails['room_number'],
        date('Y-m-d'),
        date('Y-m-d', strtotime('+1 month'))
    );
    $stmt->execute([$admin_id, $data['student_id'], $description]);

    $conn->commit();
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>