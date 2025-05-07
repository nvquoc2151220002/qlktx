<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

try {
    $stmt = $conn->prepare("SELECT fee_id, name_fee as fee_type, price as amount, fee_date as created_at FROM fee ORDER BY fee_date DESC");
    $stmt->execute();
    $fees = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the date for each fee
    foreach ($fees as &$fee) {
        $fee['created_at'] = date('d/m/Y', strtotime($fee['created_at']));
        $fee['amount'] = floatval($fee['amount']);
    }

    echo json_encode($fees);
} catch (Exception $e) {
    echo json_encode(["error" => true, "message" => $e->getMessage()]);
}
?>
