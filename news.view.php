<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="news.css">
    <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
    <title>News</title>
</head>
<body>
<button type="button" class="btn btn-secondary" id="reload">Rafraichir la page</button>
<div class="container">
    <!-- display news-->
    <div id="news-container"></div>
</div>
<div id="load-more">Lire plus d'annonces</div>

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