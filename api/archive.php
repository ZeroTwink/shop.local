<?php
include_once('../sys/inc/start.php');
$api = new API();

$error = [
    "type" => 0,
    "message" => ""
];

if(isset($_GET['id'])) {
    $id = (int)$_GET['id'];

    $res = Db::me()->prepare("SELECT * FROM `gds` WHERE `id` = ? LIMIT 1");
    $res->execute([$id]);
    $data = $res->fetch();

    if(!$data || $data['id_vk'] != $user->id_vk) {
        $error = [
            "type" => 2,
            "message" => "Запрашиваемого объявления нет, или оно размещено не вами"
        ];
        $api->assign("error", $error);
        exit;
    }

    $time = TIME;

    $res = Db::me()->query("UPDATE `gds` SET `time` = $time, `archive` = 0 WHERE `id` = $id");

    $data['time'] = TIME;
    $data['archive'] = 0;

    $api->assign("product", $data);

    exit;
}



$page = $_GET['page'];
$offset = $page * 10;

$res = Db::me()->query("SELECT * FROM `gds` WHERE `id_vk` = $user->id_vk AND `archive` = 1 ORDER BY `id` DESC LIMIT $offset, 10");
$new_gds = $res->fetchAll();

$api->assign("gds", $new_gds);