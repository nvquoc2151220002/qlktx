<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

try {
    if (!isset($_GET['student_id'])) {
        throw new Exception('Missing student_id parameter');
    }

    $student_id = $_GET['student_id'];
    
    $db = new dbconnect();
    $conn = $db->connect();

    $sql = "SELECT c.*, s.full_name, s.phone, s.email, s.school, s.department,
            s.date_of_birth, s.gender, s.status as student_status, r.building, r.room_number, 
            r.price as room_price
            FROM contract c
            JOIN student s ON c.student_id = s.student_id
            JOIN room r ON c.room_id = r.room_id
            WHERE c.student_id = ?
            ORDER BY c.contract_id DESC LIMIT 1";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([$student_id]);
    $contract = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$contract) {
        echo json_encode([
            "success" => false,
            "message" => "Không tìm thấy hợp đồng cho sinh viên này"
        ]);
        exit;
    }

    // Thêm thông tin mặc định cho các trường không có trong CSDL
    $contract['class'] = '21CT1'; 
    $contract['cmnd_cccd'] = '123456789012'; 
    $contract['date_of_issue'] = '2020-01-01'; 
    $contract['place_of_issue'] = 'Công an tỉnh Đà Nẵng'; 
    $contract['permanent_residence'] = '14 Doãn Uẫn, Khuê Mỹ, Ngũ Hành Sơn, Đà Nẵng';

    $dormitory_fee = 270000;
    $parking_fee = 30000;

    $contract['fees'] = [
        'dormitory_fee' => $dormitory_fee,
        'parking_fee' => $parking_fee,
        'total' => $contract['total_amount']
    ];

    echo json_encode([
        "success" => true,
        "data" => $contract
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>
