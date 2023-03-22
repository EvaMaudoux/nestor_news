<?php

require 'database.php';
require 'news.lib.php';

$connect = connect();

$newNews = insertNews();

/*
// Encodage des données en JSON
$json_response = json_encode($newNews);

header('Content-Type: application/json');
echo $json_response;
*/
// Vérification de la nouvelle

if (insertNews()) {
    $response = array(
        'success' => true,
        'news' => $newNews
    );
} else {
    $response = array(
        'success' => false,
        'message' => 'Erreur lors de l\'ajout de la nouvelle.'
    );
}

// Encodage des données en JSON
$json_response = json_encode($response);

header('Content-Type: application/json');
echo $json_response;
