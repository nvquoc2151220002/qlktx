<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();
$data = json_decode(file_get_contents("php://input"), true);
$student_id = $data['student_id'];

try {
    $conn->beginTransaction();

    // Lấy thông tin hóa đơn và sinh viên
    $sql = "SELECT i.*, i.issue_date as current_issue_date, i.due_date as current_due_date,
            s.full_name, s.room_number, c.contract_id, c.status as contract_status
            FROM invoice i
            JOIN contract c ON i.contract_id = c.contract_id
            JOIN student s ON c.student_id = s.student_id
            WHERE c.student_id = ? AND i.payment_status = 'Chưa thanh toán'";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$student_id]);
    $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$invoice) {
        throw new Exception("Không tìm thấy hóa đơn cần thanh toán");
    }

    // Cập nhật trạng thái thanh toán
    $sql = "UPDATE invoice SET payment_status = 'Đã thanh toán'
            WHERE invoice_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$invoice['invoice_id']]);

    // Cập nhật trạng thái hợp đồng thành "Hiệu lực" nếu đang "Hết hạn"
    if ($invoice['contract_status'] === 'Hết hạn') {
        $sql = "UPDATE contract SET status = 'Hiệu lực'
                WHERE contract_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$invoice['contract_id']]);
    }

    // Ghi log
    $sql = "INSERT INTO activity_log (admin_id, action_type, module, record_id, description, created_at)
            VALUES (?, 'UPDATE', 'payment', ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $admin_id = isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1;
    $description = sprintf(
        "Thu phí sinh viên %s (Phòng %s) - Số tiền: %s VNĐ",
        $invoice['full_name'],
        $invoice['room_number'],
        number_format($invoice['total_amount'])
    );
    $stmt->execute([$admin_id, $invoice['invoice_id'], $description]);

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Thanh toán thành công và đã cập nhật trạng thái hợp đồng"]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>