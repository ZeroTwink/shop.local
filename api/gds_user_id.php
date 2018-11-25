<?php
include_once('../sys/inc/start.php');
$api = new API();

if(!isset($_GET['id']) || !isset($_GET['page'])) {
    $error = [
        "type" => 1,
        "message" => "Ошибка выбора выбоа"
    ];
    $api->assign("error", $error);
    exit;
}

$page = $_GET['page'];
$offset = $page * 10;

$id = (int)$_GET['id'];

$res = Db::me()->query("SELECT * FROM `gds` WHERE `id_vk` = $id AND `archive` = 0 ORDER BY `time` DESC LIMIT $offset, 10");
$new_gds = $res->fetchAll();

$api->assign("gds", $new_gds);