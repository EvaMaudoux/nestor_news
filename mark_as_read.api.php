<?php
require 'database.php';

$connect = connect();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $news_id = $_POST['news_id'];
    $username = $_POST['username'];

    // Récupération des utilisateurs qui ont déjà lu cette news
    $sql = "SELECT read_by FROM news WHERE id = :news_id";
    $req = $connect->prepare($sql);
    $req->bindParam(':news_id', $news_id);
    $req->execute();
    $row = $req->fetch();
    $read_by = $row['read_by'];

    // Ajout de l'utilisateur à la liste de ceux qui ont lu l'annonce
    if (empty($read_by)) {
        $read_by = $username;
    } else {
        $read_by .= ',' . $username;
    }

    // Mise à jour de la base de données
    $sql = "UPDATE news SET read_by = :read_by WHERE id = :news_id";
    $req = $connect->prepare($sql);
    $req->bindParam(':read_by', $read_by);
    $req->bindParam(':news_id', $news_id);
    $req->execute();
    echo 'Annonce lue par ' . $username;
} else {
    // Si la requête n'est pas de type POST, revoyer une erreur
    http_response_code(400);
    echo json_encode(array('error' => 'Requête invalide'));
}
