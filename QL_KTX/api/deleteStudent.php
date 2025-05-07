<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

$data = json_decode(file_get_contents("php://input"), true);
$student_id = $data['student_id'];
$reason = isset($data['reason']) ? $data['reason'] : '';

try {
    $conn->beginTransaction();

    // Get student details before deletion
    $stmt = $conn->prepare("SELECT full_name, building, room_number FROM student WHERE student_id = ?");
    $stmt->execute([$student_id]);
    $studentDetails = $stmt->fetch(PDO::FETCH_ASSOC);

    // Kiểm tra hợp đồng
    $stmt = $conn->prepare("SELECT * FROM contract WHERE student_id = ? AND status = 'Hiệu lực'");
    $stmt->execute([$student_id]);

    if ($stmt->rowCount() > 0 && empty($reason)) {
        throw new Exception("Vui lòng nhập lý do xóa sinh viên có hợp đồng hiệu lực.");
    }

    // Ghi log trước khi xóa
    $sql = "INSERT INTO activity_log (admin_id, action_type, module, record_id, description, created_at)
            VALUES (?, 'DELETE', 'student', ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $admin_id = isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1;
    $description = sprintf(
        "Xóa sinh viên %s (Phòng %s%s)%s",
        $studentDetails['full_name'],
        $studentDetails['building'],
        $studentDetails['room_number'],
        $reason ? " - Lý do: " . $reason : ""
    );
    $stmt->execute([$admin_id, $student_id, $description]);

    // Xóa sinh viên
    $deleteStmt = $conn->prepare("DELETE FROM student WHERE student_id = ?");
    $deleteStmt->execute([$student_id]);

    $conn->commit();
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["error" => $e->getMessage()]);
}
?>
