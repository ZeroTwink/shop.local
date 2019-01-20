<?php
include_once('../sys/inc/start.php');
$api = new API();

if(!isset($_GET['id'])) {
    $error = [
        "type" => 1,
        "message" => "Ошибка выбора категории"
    ];
    $api->assign("error", $error);
    exit;
}

$id = $_GET['id'];

$page = $_GET['page'];
$offset = $page * 40;


if($_GET['id'] == 'new') {
    $res = Db::me()->query("SELECT * FROM `gds` WHERE `archive` = 0 ORDER BY `time` DESC LIMIT $offset, 40");
    $data = $res->fetchAll();

    $api->assign("gds", $data);

    exit;
}


$res = Db::me()->prepare("SELECT * FROM `gds` WHERE `category` = ? AND `archive` = 0 ORDER BY `time` DESC LIMIT  $offset, 40");
$res->execute([$id]);
$data = $res->fetchAll();

$api->assign("gds", $data);