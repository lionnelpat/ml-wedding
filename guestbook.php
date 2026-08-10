<?php
// Livre d'or : stocke et sert les messages laisses par les invites.
header('Content-Type: application/json; charset=utf-8');

$dataDir  = __DIR__ . '/data';
$dataFile = $dataDir . '/guestbook.json';

function gb_read_all($dataFile) {
    if (!file_exists($dataFile)) {
        return [];
    }
    $raw = file_get_contents($dataFile);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $messages = array_reverse(gb_read_all($dataFile));
    echo json_encode(['success' => true, 'messages' => $messages]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Honeypot anti-spam : les bots remplissent souvent ce champ caché.
    if (!empty($_POST['website'])) {
        echo json_encode(['success' => true]);
        exit;
    }

    $name    = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
    $message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';

    if ($name === '' || $message === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Merci de remplir votre nom et votre message."]);
        exit;
    }

    $name    = mb_substr($name, 0, 60);
    $message = mb_substr($message, 0, 500);

    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    if (!file_exists($dataFile)) {
        file_put_contents($dataFile, '[]');
    }

    $fp = fopen($dataFile, 'c+');
    if ($fp === false) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => "Impossible d'enregistrer votre message."]);
        exit;
    }

    flock($fp, LOCK_EX);
    $size = filesize($dataFile) ?: 0;
    $raw = $size > 0 ? fread($fp, $size) : '';
    $messages = json_decode($raw, true);
    if (!is_array($messages)) {
        $messages = [];
    }

    $entry = [
        'id'      => uniqid('gb_', true),
        'name'    => $name,
        'message' => $message,
        'date'    => date('c'),
    ];
    $messages[] = $entry;

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($messages, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    // Notification (best-effort) au couple.
    $to = "foundationirs@gmail.com";
    $subject = "Nouveau message dans le livre d'or ML-Wedding";
    $body = $name . " a laisse un message :\n\n" . $message;
    $headers = "From: no-reply@ml-wedding.local";
    @mail($to, $subject, $body, $headers);

    echo json_encode(['success' => true, 'entry' => $entry]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
