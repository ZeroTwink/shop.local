<?php
include_once('../sys/inc/start.php');
$api = new API();

if(!isset($_GET['id_img'])) {
    $error = [
        "type" => 2,
        "message" => "Объявление удалено или еще не размещено"
    ];
    $api->assign("error", $error);
    exit;
}
$id_img = (int)$_GET['id_img'];

if(!isset($_GET['id'])) {
    $error = [
        "type" => 2,
        "message" => "Объявление удалено или еще не размещено"
    ];
    $api->assign("error", $error);
    exit;
}
$id = (int)$_GET['id'];

$res = Db::me()->prepare("SELECT * FROM `gds` WHERE `id` = ? LIMIT 1");
$res->execute([$id]);
$data = $res->fetch();


if($data['id_vk'] != $user->id_vk && $user->access <= 6) {
    $error = [
        "type" => 3,
        "message" => "У вас нет прав на редактирование объявления"
    ];
    $api->assign("error", $error);
    exit;
}


$all_images = [];
if($data['images']) {
    $all_images = explode(',', $data['images']);
}

if(empty($all_images[$id_img])) {
    $error = [
        "type" => 4,
        "message" => "Не найдена фотография"
    ];
    $api->assign("error", $error);
    exit;
}



$up_gds = Db::me()->prepare("UPDATE `gds` SET `image_preview` = ? WHERE `id` = ? LIMIT 1");
$up_gds->execute([$id_img, $id]);

$api->assign("image_preview", $id_img);