<?php
include_once('../sys/inc/start.php');
$api = new API();


if(empty($_GET['rotate'])) {
    exit;
}

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



$folder = substr($id, -1);

$json_arr = "";
if(file_exists(H . "/sys/files/gds/folder_" . $folder . "/" . $id . ".json")) {
    $json_arr = Json::decode(file_get_contents(H . "/sys/files/gds/folder_" . $folder . "/" . $id . ".json"));
}

if(file_exists(H."/sys/files/gds/folder_".$folder."/".'post_' . $id . "_" . $id_img . "_original.jpg")) {
    $scr = new ImageResize(H."/sys/files/gds/folder_".$folder."/".'post_' . $id . "_" . $id_img . "_original.jpg");
} else {
    $scr = new ImageResize(H.'/sys/files/gds/' . $all_images[$id_img]);
}

$rotate = (int)$_GET['rotate'];

if($json_arr && $json_arr['images'][$id_img]) {
    $rotate = $json_arr['images'][$id_img]['rotate'] + (int)$_GET['rotate'];

    if($rotate > 360) {
        $rotate = $rotate - 360;
    }

    $json_arr['images'][$id_img]['rotate'] = $rotate;

    file_put_contents(H . "/sys/files/gds/folder_" . $folder . "/" . $id . ".json", Json::encode($json_arr));
}


$scr->resizeToWidth(900, $rotate);
$scr->saveImage(H."/sys/files/gds/folder_".$folder."/".'post_' . $id . "_" . $id_img .
    ".jpg", 80);


$up_gds = Db::me()->prepare("UPDATE `gds` SET `time_update` = ? WHERE `id` = ? LIMIT 1");
$up_gds->execute([TIME, $id]);

$api->assign("time_update", TIME);