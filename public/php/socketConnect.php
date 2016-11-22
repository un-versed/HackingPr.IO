<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
use ElephantIO\Client;
use ElephantIO\Engine\SocketIO\Version1X;
require __DIR__ . '\vendor\autoload.php';
session_start();
$client = new Client(new Version1X('http://localhost:3000'));
$client->initialize();
if($_POST['cmd'] == 'new:msg'){
$client->emit('new:msg', 
[
    'sender_ip' => $_SESSION['user_ip'], 
    'receiver_ip' => $_POST['ip_address'],
    'msg' => $_POST['msg']
]);
}

$client->close();