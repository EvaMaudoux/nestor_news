php
<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = file_get_contents('php://input');
    $subscription = json_decode($data);
    // Enregistrer l'abonnement de l'utilisateur dans votre base de données ou autre système de stockage
    // Répondre avec une réponse 200 OK
    http_response_code(200);
} else {
    // Répondre avec une réponse 405 Method Not Allowed si une autre méthode HTTP est utilisée
    http_response_code(405);
    header('Allow: POST');
    echo 'Method Not Allowed';
}
