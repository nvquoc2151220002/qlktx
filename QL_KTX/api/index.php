<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

$method = $_SERVER['REQUEST_METHOD'];
switch($method) {
    case "POST":
        $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
        if ($contentType === "application/json") {
            $data = json_decode(file_get_contents('php://input'));
            if (isset($data->action)) {
                if ($data->action === "login") {
                    include 'login.php';
                } elseif ($data->action === "register") {
                    include 'register.php';
                }
            }
        }
        break;
    default:
        // Redirect to main page or handle GET requests
        break;
}
?>
