<?php

require_once 'vendor/autoload.php';

/**
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

function insertNews(): bool|int
{
    $connect = connect();

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

        // Récupération du lienz
        if (!empty($_POST['link'])) {
            $link = $_POST['link'];
        }
    }

    // Insertion en bd
    $sql = "INSERT INTO news (title, content, created_at, status, image, pdf, link, date_publication)
              VALUES ('$title', '$content', '$created_at', '$status', '$image', '$pdf', '$link', '$date_publication')";

    $result = $connect->exec($sql);

   // header("Location: news.view.php?ak=eva");

    return $result;
}


/*
function notify () {
    // sauvegarde des infos d'authentifications avec notre clé publique et privée
    $auth = [
        'VAPID' => [
            'subject' => 'mailto:your@email.com',
            // clé publique envoyée au client quand il s'abonne aux notifs
            'publicKey' => 'BDn_CICcdB6-9NWsLhu1M0TxaWJapXYIAbLfbmt8CJ57R3u1_j0LOCj7FaJ4he_jFXlNj80COOInb_QGgZi0uHk',
            // clé privée pour signer les notif push envoyées
            'privateKey' => 'PCa_mV_QFjONEtyy_wchgv4xQCMB0TXQ8jMjjra__IU',
        ]
    ];

    // On récupère les différents abonnements uniques
    $subscriptions = getSubscriptions();
    // var_dump($subscriptions);

    // nouvelle instance de la classe WebPush (fournie par la bibliothèque Minishlink/WebPush)
    $webPush = new WebPush($auth);

    // On boucle sur tous les abonnements aux notifications pour faire un queueNotification
    foreach ($subscriptions as $subscription) {

        $webPush->queueNotification(
            Subscription::create([
                'endpoint' => $subscription['endpoint'],
                'publicKey' => $subscription['auth'],
                'authToken' => $subscription['p256dh'],
            ]),
            json_encode([
                'title' => 'Nouvelle annonce',
                'message' => 'Nestor a publié une nouvelle annonce (sendNotif).',
                'url' => 'https://www.gmail.com'
            ]),

        );
        $webPush->flush();
    }



}
*/








