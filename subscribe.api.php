<?php

require 'database.php';
require 'news.lib.php';

$connect = connect();

// Récupère les données d'abonnement
$data = json_decode(file_get_contents('php://input'), true);

// Insertion des données d'abonnement en base de données (subscriptions)
$sql = "INSERT INTO subscription (endpoint, auth_token, public_key) VALUES ('".$data['endpoint']."', '".$data['keys']['auth']."', '".$data['keys']['p256dh']."')";

if ($connect->query($sql) === TRUE) {
    // Envoi d'une réponse JSON avec un message de confirmation
    $response = array('success' => true, 'message' => 'Subscription saved successfully.');
    echo json_encode($response);
} else {
    // Envoi d'une réponse JSON avec un message d'erreur
    $response = array('success' => false, 'message' => 'Error saving subscription: '.$connect->error);
    echo json_encode($response);
}
