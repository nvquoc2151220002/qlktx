<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

try {
    $conn->beginTransaction();

    // Cập nhật trạng thái hợp đồng hết hạn
    $sql = "UPDATE contract 
            SET status = 'Hết hạn'
            WHERE DATE_ADD(end_date, INTERVAL 1 WEEK) < CURDATE() 
            AND status = 'Hiệu lực'";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $contractsUpdated = $stmt->rowCount();

    // Cập nhật trạng thái hóa đơn quá hạn
    $sql = "UPDATE invoice
            SET payment_status = 'Quá hạn'
            WHERE DATE_ADD(due_date, INTERVAL 1 WEEK) < CURDATE()
            AND payment_status = 'Chưa thanh toán'";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $overdueInvoicesUpdated = $stmt->rowCount();

    // Cập nhật trạng thái sinh viên tốt nghiệp
    $sql = "UPDATE student 
            SET status = 'Đã tốt nghiệp'
            WHERE graduation_date <= CURDATE()
            AND status = 'Đang học'";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $graduatedStudentsUpdated = $stmt->rowCount();

    // Tạo hóa đơn mới cho các hóa đơn đã thanh toán và đã đến hạn tạo mới
    $sql = "INSERT INTO invoice (contract_id, issue_date, due_date, total_amount, payment_status)
            SELECT 
                i.contract_id,
                DATE_ADD(i.issue_date, INTERVAL 1 MONTH),
                DATE_ADD(i.due_date, INTERVAL 1 MONTH),
                i.total_amount,
                'Chưa thanh toán'
            FROM invoice i
            JOIN contract c ON i.contract_id = c.contract_id
            WHERE i.payment_status = 'Đã thanh toán'
            AND c.status = 'Hiệu lực'
            AND DATE_ADD(i.issue_date, INTERVAL 1 MONTH) <= CURDATE()
            AND NOT EXISTS (
                SELECT 1 FROM invoice i2 
                WHERE i2.contract_id = i.contract_id
                AND i2.issue_date = DATE_ADD(i.issue_date, INTERVAL 1 MONTH)
            )";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $newInvoicesCreated = $stmt->rowCount();

    // Sao chép các khoản phí từ hóa đơn cũ sang hóa đơn mới
    $sql = "INSERT INTO invoice_fee (invoice_id, fee_id)
            SELECT new_i.invoice_id, inv_fee.fee_id
            FROM invoice new_i
            JOIN invoice old_i ON DATE_ADD(old_i.issue_date, INTERVAL 1 MONTH) = new_i.issue_date
                AND old_i.contract_id = new_i.contract_id
            JOIN invoice_fee inv_fee ON old_i.invoice_id = inv_fee.invoice_id
            WHERE new_i.payment_status = 'Chưa thanh toán'
            AND NOT EXISTS (
                SELECT 1 FROM invoice_fee if2 
                WHERE if2.invoice_id = new_i.invoice_id
            )";
    $stmt = $conn->prepare($sql);
    $stmt->execute();

    $conn->commit();
    echo json_encode([
        "success" => true,
        "updates" => [
            "contracts" => $contractsUpdated,
            "newInvoices" => $newInvoicesCreated,
            "overdueInvoices" => $overdueInvoicesUpdated,
            "graduatedStudents" => $graduatedStudentsUpdated
        ]
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>