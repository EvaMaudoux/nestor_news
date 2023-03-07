<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="news.css">
    <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
    <title>Interface admin</title>
</head>
<body>

<?php
require 'database.php';
require 'news.lib.php';

$connect = connect();

$sql = "SELECT *
        FROM news 
        ORDER BY created_at DESC";

$req = $connect->prepare($sql);
$req->execute();
$news = $req->fetchAll(PDO::FETCH_ASSOC);

// vérifie si une news doit être supprimée, si oui, appel de la fonction
if (isset($_GET['delete'])) {
    $id = $_GET['delete'];
    deleteNews($id);
}
?>

<main class="container-news my-3">
    <table class="admin-news table">

        <tr class="head lead">
            <th>Titre</th>
            <th>Contenu</th>
            <th>Image</th>
            <th>Statut</th>
            <th>Publication</th>
            <th>Lu par </th>
            <th>Actions </th>
        </tr>

        <?php foreach ($news as $new) { ?>
            <tr>
                <td class="col-2"><?= $new['title']; ?></td>
                <td class="col-6"><?= $new['content']; ?></td>
                <td><img class="img-admin" src="<?= $new['image'] ?>" alt="<?= $new['title'] ?>"></td>
                <td><?= $new['status'] ? 'Publié' : 'Non publié' ?></td>
                <td><?= $new['date_publication']; ?></td>
                <td><?= $new['read_by']; ?></td>
                <td>
                    <a href="">Modifier</a>
                    <a href="?delete=<?= $new['id'] ?>" onclick="return confirm('Êtes-vous sûr de vouloir supprimer cette news ?')">Supprimer</a>
                </td>
            </tr>
        <?php } ?>
    </table>
</main>
<menu class="main-menu position-fixed-bottom full-width mb-none">
    <a href="admin.news.view.php">ADMIN</a>
    <a href="news.view.php">NEWS</a>
    <a href="addNews.form.html">ADD</a>
</menu>

</body>
</html>

