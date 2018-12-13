<?php
include_once('../sys/inc/start.php');
$api = new API();

$error = [
    "type" => 0,
    "message" => ""
];

if(!isset($_GET['id'])) {
    $error = [
        "type" => 2,
        "message" => "Объявление удалено или еще не размещено",
        "importance" => 1
    ];
    $api->assign("error", $error);
    exit;
}
$id = (int)$_GET['id'];

$res = Db::me()->prepare("SELECT * FROM `gds` WHERE `id` = ? LIMIT 1");
$res->execute([$id]);
$data = $res->fetch();

if(!$data) {
    $error = [
        "type" => 2,
        "message" => "Объявление удалено или еще не размещено",
        "importance" => 1
    ];
    $api->assign("error", $error);
    exit;
}

$res = Db::me()->query("UPDATE `gds` SET `views` = `views` + 1 WHERE `id` = $id");

$api->assign("product", $data);