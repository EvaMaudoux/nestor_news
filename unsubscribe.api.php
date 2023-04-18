<?php

require 'database.php';
require 'news.lib.php';

$connect = connect();

$data = json_decode(file_get_contents('php://input'), true);

$sql = "DELETE FROM subscription WHERE endpoint = '".$data['endpoint']."'";

if ($connect->query($sql) === TRUE) {
    $response = array('success' => true, 'message' => 'Subscription deleted successfully.');
    echo json_encode($response);
} else {
    $response = array('success' => false, 'message' => 'Error deleting subscription: '.$connect->error);
    echo json_encode($response);
}
