<?php
require_once 'dbconnect.php';

$db = new dbconnect();
$conn = $db->connect();

// Validate and sanitize input parameters
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;
$offset = ($page - 1) * $limit;

$name = isset($_GET['name']) ? trim($_GET['name']) : '';
$room = isset($_GET['room']) ? trim($_GET['room']) : '';
$school = isset($_GET['school']) ? trim($_GET['school']) : '';
$department = isset($_GET['department']) ? trim($_GET['department']) : '';
$status = isset($_GET['status']) ? trim($_GET['status']) : '';
$contractStatus = isset($_GET['contractStatus']) ? trim($_GET['contractStatus']) : '';

// Get total count first
$countSql = "SELECT COUNT(*) as total FROM student s
             LEFT JOIN contract c ON s.student_id = c.student_id
             WHERE 1=1";

$params = [];
$whereClauses = [];

if (!empty($name)) {
    $whereClauses[] = "s.full_name LIKE ?";
    $params[] = "%$name%";
}

if (!empty($room)) {
    $whereClauses[] = "s.room_number LIKE ?";
    $params[] = "%$room%";
}

if (!empty($school)) {
    $whereClauses[] = "s.school LIKE ?";
    $params[] = "%$school%";
}

if (!empty($department)) {
    $whereClauses[] = "s.department LIKE ?";
    $params[] = "%$department%";
}

if (!empty($status)) {
    $whereClauses[] = "s.status = ?";
    $params[] = $status;
}

if (!empty($contractStatus)) {
    $whereClauses[] = "c.status = ?";
    $params[] = $contractStatus;
}

if (!empty($whereClauses)) {
    $countSql .= " AND " . implode(" AND ", $whereClauses);
}

$countStmt = $conn->prepare($countSql);
$countStmt->execute($params);
$totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

// Get paginated data
$sql = "SELECT s.student_id, s.full_name, s.room_number, s.building, 
               s.date_of_birth, s.gender, s.phone, s.email, s.school, s.department,
               c.contract_id, c.start_date, c.end_date, s.status,
               c.status as contract_status
        FROM student s
        LEFT JOIN contract c ON s.student_id = c.student_id
        WHERE 1=1";

if (!empty($whereClauses)) {
    $sql .= " AND " . implode(" AND ", $whereClauses);
}

// Add pagination directly to the SQL query
$sql .= " ORDER BY s.full_name ASC LIMIT $limit OFFSET $offset";

$stmt = $conn->prepare($sql);
$stmt->execute($params);
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'students' => $students,
    'total' => $totalCount,
    'page' => $page,
    'limit' => $limit
]);
?>
