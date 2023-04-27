<?php
require 'database.php';

$connect = connect();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $news_id = $_POST['news_id'];
    $username = $_POST['username'];

    // Vérifie si l'utilisateur a déjà lu cette annonce
    $sql = "SELECT * FROM user_read_news WHERE username = :username AND news_id = :news_id";
    $req = $connect->prepare($sql);
    $req->bindParam(':username', $username);
    $req->bindParam(':news_id', $news_id);
    $req->execute();
    $row = $req->fetch();

    // Si pas
    if (!$row) {
        // Insertion du couple user - annonce dans la table user_read_news
        $sql = "INSERT INTO user_read_news (username, news_id) VALUES (:username, :news_id)";
        $req = $connect->prepare($sql);
        $req->bindParam(':username', $username);
        $req->bindParam(':news_id', $news_id);
        $req->execute();
    }
} else {
    // Si la requête n'est pas de type POST, renvoyer une erreur
    http_response_code(400);
    echo json_encode(array('error' => 'Requête invalide'));
}