<?php
include_once('../sys/inc/start.php');
$api = new API();

if(!isset($_GET['id'])) {
    exit;
}
$id = (int)$_GET['id'];

$error = [
    "type" => 0,
    "message" => ""
];

$res = Db::me()->prepare("SELECT * FROM `gds` WHERE `id` = ? LIMIT 1");
$res->execute([$id]);
$data = $res->fetch();

if(!$data) {
    $error = [
        "type" => 2,
        "message" => "Объявление удалено или еще не размещено"
    ];
    $api->assign("error", $error);
    exit;
}

$api->assign("product", $data);