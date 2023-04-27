<?php

require __DIR__ . '/vendor/autoload.php';

use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;


/**
 * Récupère toutes les annonces (pour la page admin)
 * @return array|false
 */
function getAllNews(): bool|array
{
    $connect = connect();
    $sql = "SELECT *
        FROM news 
        ORDER BY created_at DESC";

    $req = $connect->prepare($sql);
    $req->execute();
    return $req->fetchAll(PDO::FETCH_ASSOC);

}

/**
 * Récupère les annonces à afficher aux utilisateurs
 * @return array|false
 */
function getLatestNews(): bool|array
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

/**
 * Ajout d'une nouvelle annonce
 * @return bool|int
 */
function insertNews(): bool|int
{
    $connect = connect();

    $title = $_POST['title'];
    $content = $_POST['content'];
    // On force le fuseau horaire pour que la date de publication corresponde à la bonne heure (fuseau UTC par défaut)
    date_default_timezone_set('Europe/Brussels');
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
    $sql = "INSERT INTO news (title, content, created_at, status, image, pdf, link, date_publication, notification_time)
              VALUES ('$title', '$content', '$created_at', '$status', '$image', '$pdf', '$link', '$date_publication', '$date_publication')";

    $result = $connect->exec($sql);
   header("Location: news.view.php?ak=eva");

return $result;
}


/**
 * Modifie une annonce (page admin)
 * @return void
 */
function editNews() {
    $connect = connect();
    if (isset($_GET['edit'])) {
        $edit_id = $_GET['edit'];
        $sql = "SELECT * FROM news WHERE id = :id";
        $req = $connect->prepare($sql);
        $req->execute([':id' => $edit_id]);
        return $req->fetch(PDO::FETCH_ASSOC);
    }
}

/**
 * Récupère les annonces dont la notification n'a pas encore été envoyée aux utilisateurs (annonce datée postérieurement)
 * @return array
 */
function getNewsForNotification(): array
{
    $connect = connect();

    $sql = "SELECT *
            FROM news
            WHERE status = 1 AND notification_sent = 0 AND notification_time <= NOW()";

    $req = $connect->prepare($sql);
    $req->execute();
    return $req->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Récupère les utilisateurs ayant interagi avec des annonces (username = code d'accès URL)
 * @return bool|array
 */
function getAllUsernames(): bool|array
{
    $connect = connect();

    $sql = "SELECT DISTINCT username FROM user_read_news";
    $req = $connect->prepare($sql);
    $req->execute();
    return $req->fetchAll(PDO::FETCH_COLUMN);
}


/**
 * Récupère la/les annonce(s) lue(s) pour un utilisateur donné (en paramètre)
 * @param $username
 * @return bool|array
 */
function getReadNewsByUsername($username): bool|array
{
    $connect = connect();

    $sql = "SELECT news.* FROM user_read_news
            INNER JOIN news ON user_read_news.news_id = news.id
            WHERE user_read_news.username = :username";
    $req = $connect->prepare($sql);
    $req->bindParam(':username', $username);
    $req->execute();
    return $req->fetchAll(PDO::FETCH_ASSOC);
}


/**
 * Récupère les abonnements aux notifications
 * @return bool|array
 */
function getSubscriptions(): bool|array
{
    $connect = connect();

    $sql = "SELECT DISTINCT *
        FROM subscription";

    $req = $connect->prepare($sql);
    $req->execute();
    return $req->fetchAll(PDO::FETCH_ASSOC);
}


/**
 * Envoi d'une notification via WebPush
 * @return void
 * @throws ErrorException
 */
function notify() {

    // Je récupère les différents abonnements aux notifications présents en base de donnée
    $subscriptions = getSubscriptions();

    // Je m'authentifie auprès du serveur Push avec ma clé privée et ma clé publique générées
    $auth = [
        'VAPID' => [
            'subject' => 'mailto:your@email.com',
            'publicKey' => 'BDn_CICcdB6-9NWsLhu1M0TxaWJapXYIAbLfbmt8CJ57R3u1_j0LOCj7FaJ4he_jFXlNj80COOInb_QGgZi0uHk',
            'privateKey' => 'PCa_mV_QFjONEtyy_wchgv4xQCMB0TXQ8jMjjra__IU',
        ],
    ];

    $webPush = new WebPush($auth);

    // S'il y a des annonces datées postérieurement, je les récupère
    $newsList = getNewsForNotification();

    // Pour chaque abonnement présent dans la base de données, création du payload de la notification
    foreach ($subscriptions as $subscription) {
        // Pour les annonces datées postérieurement
        foreach($newsList as $news) {
            // var_dump($news);
            $payload = json_encode([
                'title' => 'Nouvelle annonce !',
                'body' => $news['title'],
                'icon' => 'nestor.png',
            ]);
            // chaque notification est placée dans une file d'attente
            $webPush->queueNotification(
                // récupération des données authentifiantes de chaque abonnement (de chaque utilisateur)
                Subscription::create([
                    'endpoint' => $subscription['endpoint'],
                    'publicKey' => $subscription['public_key'],
                    'authToken' => $subscription['auth_token'],
                    'contentEncoding' => $subscription['content_encoding']
                ]),
                $payload
            );
        }
    }

    // Envoi des notifications à chaque abonné
        $results = $webPush->flush();

        foreach ($results as $result) {
            $endpoint = $result->getRequest()->getUri()->__toString();

            if ($result->isSuccess()) {
                var_dump("[v] Message sent successfully for subscription {$endpoint}.");
            } else {
                var_dump("[x] Message failed to sent for subscription {$endpoint}: {$result->getReason()}");
            }
        }

    // Je marque les annonces comme 'notifiées'
    foreach ($newsList as $news) {
        $connect = connect();
        $id = $news['id'];
        $sql = "UPDATE news SET notification_sent = 1 WHERE id = :id";
        $req = $connect->prepare($sql);
        $req->execute([':id' => $id]);
    }
}









