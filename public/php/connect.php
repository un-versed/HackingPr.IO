<?php
session_start();
use ElephantIO\Client;
use ElephantIO\Engine\SocketIO\Version1X;
require __DIR__ . '\vendor\autoload.php';
include("conn.php");
$usr = $_POST['usr'];
$pwd = $_POST['pwd'];
$SQL = "SELECT * FROM users WHERE usr = '$usr';";

$result = $mysqli->query($SQL);

while ($row = $result->fetch_array())
{
     if($pwd == $row['pwd'])
     {
         $SQL = "SELECT ip FROM iplist WHERE id_usr = '". $row['id_usr'] ."';";
         $result = $mysqli->query($SQL);
         $value = $result->fetch_object();
         $_SESSION['user_id'] = $row['id_usr'];
         $_SESSION['user_ip'] = $value->ip;
         $_SESSION['user_nick'] = $row['usr'];
         header('Access-Control-Allow-Origin: http://localhost:3000');
            $client = new Client(new Version1X('http://localhost:3000'));
            $client->initialize();
            $client->emit('login', 
            [
                'user_ip' => $_SESSION['user_ip'], 
                'sid' => $_POST['sid'],
                'user_nick' => $_SESSION['user_nick']
            ]);
            $client->close();
         echo 1;
     }
    else {
        echo 0;
    }

}
$mysqli->close();

?>