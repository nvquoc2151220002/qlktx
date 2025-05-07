<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

try {
    $conn->beginTransaction();

    // Handle file upload if new image is provided
    $image_url = null;
    if (isset($_FILES['new_image'])) {
        $target_dir = "../QL_KTX/demo/public/images/";
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0777, true);
        }

        // Get original filename and sanitize it
        $original_filename = basename($_FILES['new_image']['name']);
        $original_filename = preg_replace("/[^a-zA-Z0-9.]/", "_", $original_filename);

        // Check if file with same name already exists
        if (!file_exists($target_dir . $original_filename)) {
            if (move_uploaded_file($_FILES['new_image']['tmp_name'], $target_dir . $original_filename)) {
                $image_url = '/images/' . $original_filename;
            }
        } else {
            // If file already exists, just use the existing path
            $image_url = '/images/' . $original_filename;
        }
    }

    // Get other form data
    $_POST = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    // Update student information
    $sql = "UPDATE student 
            SET full_name = ?, date_of_birth = ?, gender = ?, phone = ?, email = ?, 
                school = ?, department = ?, graduation_date = ?, status = ?" .
            ($image_url ? ", image_url = ?" : "") .
            " WHERE student_id = ?";

    $params = [
        $_POST['full_name'], 
        $_POST['date_of_birth'], 
        $_POST['gender'], 
        $_POST['phone'],
        $_POST['email'],
        $_POST['school'],
        $_POST['department'],
        $_POST['graduation_date'],
        $_POST['status']
    ];

    if ($image_url) {
        $params[] = $image_url;
    }
    $params[] = $_POST['student_id'];

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    // Get student's building and room info for logging
    $stmt = $conn->prepare("SELECT building, room_number FROM student WHERE student_id = ?");
    $stmt->execute([$_POST['student_id']]);
    $locationInfo = $stmt->fetch(PDO::FETCH_ASSOC);

    // Log the update
    $sql = "INSERT INTO activity_log (admin_id, action_type, module, record_id, description, created_at)
            VALUES (?, 'UPDATE', 'student', ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $admin_id = isset($_SESSION['admin_id']) ? $_SESSION['admin_id'] : 1;
    $description = sprintf(
        "Cập nhật thông tin sinh viên: %s (Phòng %s%s) - Chi tiết: Giới tính: %s, SĐT: %s, Email: %s, Trường: %s, Khoa: %s, Ngày tốt nghiệp: %s, Tình trạng: %s, Ảnh: %s",
        $_POST['full_name'],
        $locationInfo['building'],
        $locationInfo['room_number'],
        $_POST['gender'],
        $_POST['phone'],
        $_POST['email'],
        $_POST['school'],
        $_POST['department'],
        $_POST['graduation_date'],
        $_POST['status'],
        $image_url
    );
    $stmt->execute([$admin_id, $_POST['student_id'], $description]);

    $conn->commit();
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
