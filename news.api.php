<?php

require_once 'vendor/autoload.php';
require 'database.php';
require 'news.lib.php';

$connect = connect();

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'GET') {
    // Récupération des dernières news
    $news = getLatestNews();

    // Encodage des données en JSON
    $json_news = json_encode($news);

   header('Content-Type: application/json');
   echo $json_news;

} else {
    // Si la requête n'est pas de type POST, renvoyer une erreur 400 Bad Request
    http_response_code(400);
    echo json_encode(array('error' => 'Requête invalide'));
}

