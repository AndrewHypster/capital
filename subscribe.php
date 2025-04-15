<?php
$name = $_POST['name'];
$email = $_POST['email'];
$tel = $_POST['tel'];
$offerta = $_POST['offerta'];
$subscribe = $_POST['subscribe'];
$page = $_POST['page'];

// Ключі з SendPulse
$client_id = '38ae8c2d109ab15d76f1352ae526733d';
$client_secret = '6bfca921092d4c5e0d0fa173326057da';

// Крок 1: Отримуємо токен доступу
$ch = curl_init('https://api.sendpulse.com/oauth/access_token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type' => 'client_credentials',
    'client_id' => $client_id,
    'client_secret' => $client_secret
]));
$response = json_decode(curl_exec($ch), true);
$token = $response['access_token'] ?? null;

if (!$token) {
    exit('❌ Помилка авторизації з API SendPulse');
}

// Крок 2: Додаємо підписника
$list_id = '179741'; // <- сюди вставляєш свій ID

// Формуємо дані для підписки
$data = [
    'emails' => [
        [
            'email' => $email,
            'variables' => [
                "Ім'я" => $name,
                'Телефон' => $tel,
                'Приймаю оферту' => $offerta,
                'Підписка розсилки' => $subscribe,
            ],
            'status' => 'subscribed'  // Статус підписки
        ]
    ]
];

$ch = curl_init("https://api.sendpulse.com/addressbooks/$list_id/emails");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data)); // Передаємо масив підписників
$result = curl_exec($ch);

echo "API Response: " . $result; // Для додаткової діагностики
$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($responseCode == 200) {
    header("Location: $page");
    exit;
} else {
    echo "❌ Сталася помилка. Спробуйте пізніше.";
}
?>