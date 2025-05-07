<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();
$data = json_decode(file_get_contents("php://input"), true);

try {
    $conn->beginTransaction();

    // Lấy thông tin phí trước khi xóa
    $stmt = $conn->prepare("SELECT name_fee, price FROM fee WHERE fee_id = ?");
    $stmt->execute([$data['fee_id']]);
    $feeInfo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$feeInfo) {
        throw new Exception("Không tìm thấy loại phí này");
    }

    // Lấy danh sách invoice_id bị ảnh hưởng
    $stmt = $conn->prepare("SELECT DISTINCT invoice_id FROM invoice_fee WHERE fee_id = ?");
    $stmt->execute([$data['fee_id']]);
    $affectedInvoices = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Xóa các bản ghi trong invoice_fee
    $stmt = $conn->prepare("DELETE FROM invoice_fee WHERE fee_id = ?");
    $stmt->execute([$data['fee_id']]);

    // Cập nhật total_amount cho các hóa đơn bị ảnh hưởng
    if (!empty($affectedInvoices)) {
        $placeholders = str_repeat('?,', count($affectedInvoices) - 1) . '?';
        $sql = "UPDATE invoice i
                SET total_amount = (
                    SELECT COALESCE(SUM(f.price), 0)
                    FROM invoice_fee if_rel
                    JOIN fee f ON if_rel.fee_id = f.fee_id
                    WHERE if_rel.invoice_id = i.invoice_id
                )
                WHERE i.invoice_id IN ($placeholders)";
        $stmt = $conn->prepare($sql);
        $stmt->execute($affectedInvoices);
    }

    // Ghi log xóa phí
    $sql = "INSERT INTO activity_log (admin_id, action_type, module, record_id, description, created_at)
            VALUES (?, 'DELETE', 'fee', ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $admin_id = isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1;
    $description = sprintf(
        "Xóa loại phí: %s - Số tiền: %s VNĐ",
        $feeInfo['name_fee'],
        number_format($feeInfo['price'])
    );
    $stmt->execute([$admin_id, $data['fee_id'], $description]);

    // Xóa fee
    $stmt = $conn->prepare("DELETE FROM fee WHERE fee_id = ?");
    $stmt->execute([$data['fee_id']]);

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Xóa phí thành công"]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["error" => true, "message" => $e->getMessage()]);
}
?>
