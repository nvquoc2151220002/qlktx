<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();
$data = json_decode(file_get_contents("php://input"), true);

try {
    $conn->beginTransaction();

    // Lấy thông tin phí trước khi cập nhật
    $stmt = $conn->prepare("SELECT name_fee, price FROM fee WHERE fee_id = ?");
    $stmt->execute([$data['fee_id']]);
    $feeInfo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$feeInfo) {
        throw new Exception("Không tìm thấy loại phí này");
    }

    // Cập nhật giá phí
    $stmt = $conn->prepare("UPDATE fee SET price = ? WHERE fee_id = ?");
    $stmt->execute([$data['amount'], $data['fee_id']]);

    // Lấy danh sách invoice_id bị ảnh hưởng
    $stmt = $conn->prepare("SELECT DISTINCT invoice_id FROM invoice_fee WHERE fee_id = ?");
    $stmt->execute([$data['fee_id']]);
    $affectedInvoices = $stmt->fetchAll(PDO::FETCH_COLUMN);

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

    // Ghi log cập nhật phí
    $sql = "INSERT INTO activity_log (admin_id, action_type, module, record_id, description, created_at)
            VALUES (?, 'UPDATE', 'fee', ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $admin_id = isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1;
    $description = sprintf(
        "Cập nhật phí: %s - Từ: %s VNĐ thành: %s VNĐ",
        $feeInfo['name_fee'],
        number_format($feeInfo['price']),
        number_format($data['amount'])
    );
    $stmt->execute([$admin_id, $data['fee_id'], $description]);

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Cập nhật phí thành công"]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["error" => true, "message" => $e->getMessage()]);
}
?>
