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

$edit_news = editNews();
$news = getAllNews();

$usernames = getAllUsernames();
?>

<!--  formulaire pour savoir quel utilisateur a lu quelle annonce -->
<h4>Qui a lu quoi?</h4>
<form method="POST" action="admin.news.view.php" class="my-3">
    <select name="username" class="m-2">
        <option value="">Sélectionnez un utilisateur</option>
        <?php foreach ($usernames as $username): ?>
            <option value="<?php echo $username; ?>"><?php echo $username; ?></option>
        <?php endforeach; ?>
    </select>
    <input type="submit" value="Annonces lues" />
</form>

<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $selectedUsername = $_POST['username'];

    if (!empty($selectedUsername)) {
        $readNews = getReadNewsByUsername($selectedUsername);

        echo "<p class='m-2'>Annonces lues par {$selectedUsername} : </p>";
        echo "<ul>";
        foreach ($readNews as $readNew) {
            echo "<li>Annonce " . $readNew['id'] . " - " . $readNew['title'] ."</li>";
        }
        echo "</ul>";
    }
}
if (isset($edit_news)) : ?>

<!-- formulaire de modification d'annonce -->
<h4>Modifier l'annonce</h4>
    <form action="editNews.php" method="post">
        <input type="hidden" name="id" value="<?= $edit_news['id'] ?>">
        <label for="title">Titre :</label>
        <input type="text" name="title" class='m-2' value="<?= $edit_news['title'] ?>">
        <br>
        <label for="content">Contenu :</label>
        <textarea name="content"><?= $edit_news['content'] ?></textarea>
        <br>
        <label for="image">Image :</label>
        <input type="text" name="image" value="<?= $edit_news['image'] ?>">
        <br>
        <label for="status">Statut :</label>
        <select name="status" class='m-2'>>
            <option value="1" <?= $edit_news['status'] ? 'selected' : '' ?>>Publié</option>
            <option value="0" <?= !$edit_news['status'] ? 'selected' : '' ?>>Non publié</option>
        </select>
        <br>
        <button type="submit" style="padding-left: 0">Mettre à jour</button>
    </form>
<?php endif; ?>

<!-- gestion de toutes les annonces -->
<h4>Gestion des annonces</h4>
<main class="container-news my-3">
        <table class="admin-news table">
        <tr>
            <th>Titre</th>
            <th>Contenu</th>
            <th>Image</th>
            <th>Statut</th>
            <th>Publication</th>
            <th>Actions </th>
        </tr>

        <?php foreach ($news as $new) { ?>
            <tr>
                <td class="col-2"><?= $new['title']; ?></td>
                <td class="col-3"><?= $new['content']; ?></td>
                <td class="col-2"><img class="img-admin" src="<?= $new['image'] ?>" alt="<?= $new['title'] ?>"></td>
                <td class="col-1"><?= $new['status'] ? 'Publié' : 'Non publié' ?></td>
                <td class="col-2"><?= $new['date_publication']; ?></td>
                <td class="col-2">
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

