<?php
require 'database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $title = $_POST['title'];
    $content = $_POST['content'];
    $image = $_POST['image'];
    $status = $_POST['status'];

    $sql = "UPDATE news
            SET title = :title, content = :content, image = :image, status = :status
            WHERE id = :id";

    $connect = connect();
    $req = $connect->prepare($sql);
    $req->execute([
        ':id' => $id,
        ':title' => $title,
        ':content' => $content,
        ':image' => $image,
        ':status' => $status
    ]);

    header('Location: admin.news.view.php?ak=eva');
}
