<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

$data = json_decode(file_get_contents("php://input"), true);

$username = $data['username'];
$password = $data['password'];

$stmt = $conn->prepare("SELECT * FROM admin WHERE username = ? AND password = ?");
$stmt->execute([$username, $password]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo json_encode(["success" => true, "message" => "Đăng nhập thành công!", "user" => $user]);
} else {
    echo json_encode(["success" => false, "message" => "Tên đăng nhập hoặc mật khẩu không đúng."]);
}
?>