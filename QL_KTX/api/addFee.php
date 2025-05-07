<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();
$data = json_decode(file_get_contents("php://input"), true);

try {
    $conn->beginTransaction();
    
    // Thêm phí mới
    $stmt = $conn->prepare("INSERT INTO fee (name_fee, price, fee_date) VALUES (?, ?, CURRENT_DATE)");
    $stmt->execute([$data['fee_type'], $data['amount']]);
    $newFeeId = $conn->lastInsertId();

    // Ghi log thêm phí
    $sql = "INSERT INTO activity_log (admin_id, action_type, module, record_id, description, created_at)
            VALUES (?, 'CREATE', 'fee', ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $admin_id = isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1;
    $description = sprintf(
        "Thêm loại phí mới: %s - Số tiền: %s VNĐ",
        $data['fee_type'],
        number_format($data['amount'])
    );
    $stmt->execute([$admin_id, $newFeeId, $description]);

    // Tạo invoice_fee cho tất cả hóa đơn chưa thanh toán
    $stmt = $conn->prepare("INSERT INTO invoice_fee (invoice_id, fee_id)
                           SELECT i.invoice_id, ?
                           FROM invoice i
                           JOIN contract c ON i.contract_id = c.contract_id
                           WHERE i.payment_status = 'Chưa thanh toán'
                           AND c.status = 'Hiệu lực'");
    $stmt->execute([$newFeeId]);

    // Cập nhật total_amount cho các hóa đơn chưa thanh toán
    $stmt = $conn->prepare("UPDATE invoice i
                           SET total_amount = (
                               SELECT SUM(f.price)
                               FROM fee f
                               INNER JOIN invoice_fee if_rel ON f.fee_id = if_rel.fee_id
                               WHERE if_rel.invoice_id = i.invoice_id
                           )
                           WHERE i.payment_status = 'Chưa thanh toán'
                           AND EXISTS (
                               SELECT 1 FROM invoice_fee 
                               WHERE invoice_id = i.invoice_id 
                               AND fee_id = ?
                           )");
    $stmt->execute([$newFeeId]);
    
    // Lấy thông tin phí mới để trả về
    $stmt = $conn->prepare("SELECT fee_id, name_fee as fee_type, price as amount, fee_date as created_at 
                           FROM fee WHERE fee_id = ?");
    $stmt->execute([$newFeeId]);
    $newFee = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Format dữ liệu trả về
    $newFee['created_at'] = date('d/m/Y', strtotime($newFee['created_at']));
    $newFee['amount'] = floatval($newFee['amount']);

    $conn->commit();
    echo json_encode($newFee);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["error" => true, "message" => $e->getMessage()]);
}
?>
