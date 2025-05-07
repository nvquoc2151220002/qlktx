<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

try {
    $conn->beginTransaction();

    // Handle image upload if provided
    $image_url = null;
    if (isset($_FILES['student_image'])) {
        $target_dir = "../QL_KTX/demo/public/images/";
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0777, true);
        }

        $original_filename = basename($_FILES['student_image']['name']);
        $original_filename = preg_replace("/[^a-zA-Z0-9.]/", "_", $original_filename);

        if (!file_exists($target_dir . $original_filename)) {
            if (move_uploaded_file($_FILES['student_image']['tmp_name'], $target_dir . $original_filename)) {
                $image_url = '/images/' . $original_filename;
            }
        } else {
            $image_url = '/images/' . $original_filename;
        }
    }

    // Kiểm tra trùng lặp email hoặc số điện thoại
    $stmt = $conn->prepare("SELECT * FROM student WHERE email = ? OR phone = ?");
    $stmt->execute([$_POST['email'], $_POST['phone']]);
    if ($stmt->rowCount() > 0) {
        throw new Exception("Email hoặc số điện thoại đã tồn tại trong hệ thống.");
    }

    // Kiểm tra số lượng người ở trong phòng
    $stmt = $conn->prepare("SELECT capacity, current_occupancy, price FROM room WHERE room_id = ?");
    $stmt->execute([$_POST['room_id']]);
    $room = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$room || $room['current_occupancy'] >= $room['capacity']) {
        throw new Exception("Phòng đã đầy hoặc không tồn tại.");
    }

    // Thêm sinh viên vào bảng STUDENT
    $sql = "INSERT INTO student (full_name, date_of_birth, gender, phone, email, 
            school, department, graduation_date, room_number, building, status, image_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Đang học', ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $_POST['full_name'], 
        $_POST['date_of_birth'],
        $_POST['gender'], 
        $_POST['phone'], 
        $_POST['email'],
        $_POST['school'], 
        $_POST['department'], 
        $_POST['graduation_date'],
        $_POST['room_number'],
        $_POST['building'],
        $image_url
    ]);

    $student_id = $conn->lastInsertId();

    // Tạo hợp đồng mới với giá phòng chia 6
    $contract_amount = $room['price'] / 6;
    $stmt = $conn->prepare("INSERT INTO contract (student_id, room_id, start_date, end_date, status, total_amount) 
                            VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 'Hiệu lực', ?)");
    $stmt->execute([$student_id, $_POST['room_id'], $contract_amount]);

    $contract_id = $conn->lastInsertId();

    // Lấy tổng giá của các loại phí
    $stmt = $conn->prepare("SELECT COALESCE(SUM(price), 0) as total_fees FROM fee");
    $stmt->execute();
    $fee_result = $stmt->fetch(PDO::FETCH_ASSOC);
    $total_fees = $fee_result['total_fees'];

    // Tạo hóa đơn mới với tổng = giá hợp đồng + tổng phí
    $invoice_amount = $contract_amount + $total_fees;
    $stmt = $conn->prepare("INSERT INTO invoice (issue_date, due_date, total_amount, payment_status, contract_id) 
                           VALUES (NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), ?, 'Chưa thanh toán', ?)");
    $stmt->execute([$invoice_amount, $contract_id]);

    $invoice_id = $conn->lastInsertId();

    // Thêm các loại phí vào bảng invoice_fee
    $stmt = $conn->prepare("INSERT INTO invoice_fee (invoice_id, fee_id) 
                           SELECT ?, fee_id FROM fee");
    $stmt->execute([$invoice_id]);


    // Cập nhật số lượng người ở trong phòng
    $stmt = $conn->prepare("UPDATE room SET current_occupancy = current_occupancy + 1,
                           status = CASE WHEN current_occupancy + 1 >= capacity THEN 'Đã đầy' ELSE 'Còn trống' END 
                           WHERE room_id = ?");
    $stmt->execute([$_POST['room_id']]);

    // Ghi log hoạt động
    $sql = "INSERT INTO activity_log (admin_id, action_type, module, record_id, description, created_at)
            VALUES (?, 'CREATE', 'student', ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $admin_id = isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1;
    $description = sprintf(
        "Đăng ký mới sinh viên: %s vào phòng %s%s",
        $_POST['full_name'],
        $_POST['building'],
        $_POST['room_number']
    );
    $stmt->execute([$admin_id, $student_id, $description]);

    $conn->commit();
    echo json_encode([
        "error" => false, 
        "message" => "Đăng ký thành công!",
        "student_id" => $student_id
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["error" => true, "message" => $e->getMessage()]);
}
?>
