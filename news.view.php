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
    <title>News</title>
</head>
<body>

<div class="container news-container">
    <h1><span>Cow</span>orking news</h1>
    <button type="button" class="btn m-0" id="reload" >Rafraichir les annonces</button>
    <!-- display news-->
    <div id="display-news"></div>
    <div id="load-more" class="m-0">Voir plus d'annonces</div>
</div>
<!-- Bouton flottant pour ouvrir le widget de gestion des notifications -->
<button id="notificationWidget" class="floating-button"><i class="icofont-notification"></i></button>

<!-- Widget pour gérer les abonnements aux notifications -->
<div id="notificationManager" class="widget">
    <h5>Gestion des notifications</h5>
    <div class="btn-container mt-4">
        <button id="acceptNotifications" style="border-radius: 7px;">Accepter</button>
        <button id="refuseNotifications" style="border-radius: 7px;">Refuser</button>
    </div>

</div>



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
</body>
</html>