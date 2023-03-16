<?php

/**
 * @return array|false
 */
function getLatestNews()
{
    $connect = connect();

    $sql = "SELECT *
        FROM news
        WHERE status = 1 AND date_publication <= NOW()
        ORDER BY date_publication DESC";

    $req = $connect->prepare($sql);
    $req->execute();
    return $req->fetchAll(PDO::FETCH_ASSOC);
}

function insertNews()
{
    $connect = connect();

    if (!empty($_POST['title']) && !empty($_POST['content'])) {
        $title = $_POST['title'];
        $content = $_POST['content'];
        $created_at = date('Y-m-d H:i:s');
        $date_publication = !empty($_POST['date_publication']) ? $_POST['date_publication'] : date('Y-m-d H:i:s');
        $image = '';
        $pdf = '';
        $link = '';

        if (!empty($_POST['status'])) {
            $status = 1;
        } else {
            $status = 0;
        }

        // Upload de l'image
        if (!empty($_FILES)) {
            if (!empty($_FILES['image']) && $_FILES['image']['tmp_name'] && $_FILES['image']['name']) {
                $dirTempo = $_FILES['image']['tmp_name'];
                $imagepath = getcwd() . '/upload/images/';
                $image = 'upload/images/' . $_FILES['image']['name'];
                move_uploaded_file($dirTempo, $image);

            }

            // Upload du PDF
            if (!empty($_FILES['pdf']) && $_FILES['pdf']['tmp_name'] && $_FILES['pdf']['name']) {
                $dirTempo = $_FILES['pdf']['tmp_name'];
                $pdfpath = getcwd() . '/upload/pdf/';
                $pdf = 'upload/pdf/' . $_FILES['pdf']['name'];
                move_uploaded_file($dirTempo, $pdf);
            }

            // Récupération du lien
            if (!empty($_POST['link'])) {
                $link = $_POST['link'];
            }
        }

        // Insertion en bd
        $sql = "INSERT INTO news (title, content, created_at, status, image, pdf, link, date_publication)
              VALUES ('$title', '$content', '$created_at', '$status', '$image', '$pdf', '$link', '$date_publication')";
        $req = $connect->exec($sql);

        // Redirection vers la page d'affichage
        header("Location: news.view.php");;

        return $req;
    }

}





