<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- CSS -->
    <link rel="stylesheet" href="news.css">
    <!-- Bootstrap -->
    <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
    <!-- Bootstrap -->
    <link rel="stylesheet" href="css/icofont/icofont.min.css">
    <!-- librairie quill (formatage pour contenu de l'annonce) -->
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <title>News</title>
</head>
<body>

<!-- Affichage des annonces-->
<div class="container news-container">
    <h1><span>Cow</span>orking news</h1>
    <button type="button"  id="reload" class="lead">Rafraichir les annonces</button>
    <div id="display-news"></div>
    <div type="button"  id="load-more" class="lead">Voir plus d'annonces</div>
</div>

<!-- Bouton flottant pour ouvrir le widget de gestion des notifications -->
<button id="notificationWidget" class="floating-button"><i class="icofont-notification"></i></button>

<!-- Widget pour gérer la permission des notifications -->
<div id="notificationManager" class="widget">
    <p>Vous avez <span id="statutNotifications">bloqué</span> les notifications !</p>
    <div class="btn-container mt-4">
        <button id="toggleNotifications" style="border-radius: 7px;">Autoriser les notifications</button>
    </div>
</div>

<!-- menu footer-->
<menu class="main-menu position-fixed-bottom full-width mb-none">
    <a href="admin.news.view.php">ADMIN</a>
    <a href="news.view.php">NEWS</a>
    <a href="addNews.form.html">ADD</a>
</menu>
<script>
    window.addEventListener('DOMContentLoaded', function() {
        News.init();
    }, true);
</script>
<script src="node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="node_modules/axios/dist/axios.min.js"></script>
<script src="news.js"></script>
<!-- librairie quill (formatage pour contenu de l'annonce) -->
<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
</body>
</html>