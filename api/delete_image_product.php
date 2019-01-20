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



$folder = substr($id, -1);

$json_arr = "";
if(file_exists(H . "/sys/files/gds/folder_" . $folder . "/" . $id . ".json")) {
    $json_arr = Json::decode(file_get_contents(H . "/sys/files/gds/folder_" . $folder . "/" . $id . ".json"));
}



if(file_exists(H."/sys/files/gds/folder_".$folder."/".'post_' . $id . "_" . $id_img . "_original.jpg")) {
    unlink(H."/sys/files/gds/folder_".$folder."/".'post_' . $id . "_" . $id_img . "_original.jpg");
}

if(file_exists(H.'/sys/files/gds/' . $all_images[$id_img])) {
    unlink(H.'/sys/files/gds/' . $all_images[$id_img]);
}


unset($all_images[$id_img]);

$all_images = array_values($all_images);


$all_images_finish = [];

for ($i = 0; $i < count($all_images); $i++) {
    $lol = rename(H."/sys/files/gds/" . $all_images[$i],
        H."/sys/files/gds/folder_".$folder."/".'post_' . $id. "_" . $i . ".jpg");

    $all_images_finish[] = "folder_".$folder."/".'post_' . $id. "_" . $i . ".jpg";

    $path = substr($all_images[$i], 0, -4);
    if(file_exists(H."/sys/files/gds/". $path . "_original.jpg")) {
        $lol2 = rename(H."/sys/files/gds/". $path . "_original.jpg",
            H."/sys/files/gds/folder_".$folder."/".'post_' . $id. "_" . $i . "_original.jpg");
    }
}

$all_images = $all_images_finish;


if($json_arr && $json_arr['images'][$id_img]) {
    unset($json_arr['images'][$id_img]);

    $json_arr['images'] = array_values($json_arr['images']);

    file_put_contents(H . "/sys/files/gds/folder_" . $folder . "/" . $id . ".json", Json::encode($json_arr));
}


$images_string = implode(",", $all_images);


$up_gds = Db::me()->prepare("UPDATE `gds` SET `images` = ?, `time_update` = ? WHERE `id` = ? LIMIT 1");
$up_gds->execute([$images_string, TIME, $id]);

$api->assign("time_update", TIME);
$api->assign("images", $images_string);