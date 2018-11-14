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

$res = Db::me()->prepare("SELECT * FROM `gds` WHERE `id` = :id LIMIT 1");
$res->execute(array(':id' => $id));
$product = $res->fetch();

if(!$product) {
    $error = [
        "type" => 2,
        "message" => "Нет такого объявления"
    ];
    $api->assign("error", $error);
    exit;
}

if($product['id_vk'] != $user->id_vk && $user->access <= 6) {
    $error = [
        "type" => 3,
        "message" => "У вас нет прав на удаления объявления"
    ];
    $api->assign("error", $error);
    exit;
}

$res = Db::me()->prepare("DELETE FROM `gds` WHERE `id` = ?");
$res->execute(Array($id));

if($product['images']) {
    $images = explode(",", $product['images']);
    foreach ($images AS $val) {
        if(file_exists(H."/sys/files/gds/" . $val)) {
            unlink(H."/sys/files/gds/" . $val);
        }
    }
}

// TODO чтобы админам не высывалось  && $product['id_vk'] != $user->id_vk
if($user->access > 6) {
    $ank = new User($product['id_vk']);

    $params = [
        "text" => "Администрация удалила ваше объявление " . Text::substr($product['title'], 26)
    ];

//    if($product['images']) {
//        $images = explode(",", $product['images']);
//        $params['image'] = $images[0];
//    }

//    $params['url'] = "/product/" . $product['id'];
//    $params['button'] = "Открыть";

    $result = $ank->addNotification('delete', $params);

    $api->assign("result", $result);
}

$api->assign("status", 1);