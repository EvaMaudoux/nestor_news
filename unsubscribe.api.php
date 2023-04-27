<?php

require 'database.php';
require 'news.lib.php';

$connect = connect();

// Récupère les données d'abonnement
$data = json_decode(file_get_contents('php://input'), true);

// Suppression des données d'abonnement en base de données
$sql = "DELETE FROM subscription WHERE endpoint = '".$data['endpoint']."'";

if ($connect->query($sql) === TRUE) {
    // Envoi d'une réponse JSON avec un message de confirmation
    $response = array('success' => true, 'message' => 'Subscription deleted successfully.');
    echo json_encode($response);
} else {
    // Envoi d'une réponse JSON avec un message d'erreur
    $response = array('success' => false, 'message' => 'Error deleting subscription: '.$connect->error);
    echo json_encode($response);
}
