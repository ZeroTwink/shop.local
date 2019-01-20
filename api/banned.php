<?php
include_once('../sys/inc/start.php');
$api = new API();

if($user->access <= 6) {
    $error = [
        "type" => 3,
        "message" => "У вас нет прав для данного действия"
    ];
    $api->assign("error", $error);
    exit;
}

if(!isset($_GET['id'])) {
    $error = [
        "type" => 2,
        "message" => "Объявление удалено или еще не размещено"
    ];
    $api->assign("error", $error);
    exit;
}
$id_vk = (int)$_GET['id'];


$ank = new User($id_vk);

$ank->ban = TIME + 60*60*24;