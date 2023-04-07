<?php
require 'database.php';

if (isset($_GET['delete'])) {
    $delete_id = $_GET['delete'];

    $sql = "DELETE FROM news WHERE id = :id";
    $connect = connect();
    $req = $connect->prepare($sql);
    $req->execute([':id' => $delete_id]);

    header('Location: admin.news.view.php');
}