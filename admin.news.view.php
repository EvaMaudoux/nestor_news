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

if (isset($_GET['edit'])) {
    $edit_id = $_GET['edit'];
    $sql = "SELECT * FROM news WHERE id = :id";
    $req = $connect->prepare($sql);
    $req->execute([':id' => $edit_id]);
    $edit_news = $req->fetch(PDO::FETCH_ASSOC);
}


$sql = "SELECT *
        FROM news 
        ORDER BY created_at DESC";

$req = $connect->prepare($sql);
$req->execute();
$news = $req->fetchAll(PDO::FETCH_ASSOC);

?>

<?php if (isset($edit_news)) : ?>
    <form action="editNews.php" method="post">
        <input type="hidden" name="id" value="<?= $edit_news['id'] ?>">
        <label for="title">Titre :</label>
        <input type="text" name="title" value="<?= $edit_news['title'] ?>">
        <label for="content">Contenu :</label>
        <textarea name="content"><?= $edit_news['content'] ?></textarea>
        <label for="image">Image :</label>
        <input type="text" name="image" value="<?= $edit_news['image'] ?>">
        <label for="status">Statut :</label>
        <select name="status">
            <option value="1" <?= $edit_news['status'] ? 'selected' : '' ?>>Publié</option>
            <option value="0" <?= !$edit_news['status'] ? 'selected' : '' ?>>Non publié</option>
        </select>
        <button type="submit">Mettre à jour</button>
    </form>
<?php endif; ?>


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
                    <a href="?edit=<?= $new['id'] ?>">Modifier</a>
                    <a href="deleteNews.php?delete=<?= $new['id'] ?>" onclick="return confirm('Êtes-vous sûr de vouloir supprimer cette news ?')">Supprimer</a>

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

