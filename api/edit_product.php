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
        "message" => "Объявление удалено или еще не размещено"
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
        "message" => "Объявление удалено или еще не размещено"
    ];
    $api->assign("error", $error);
    exit;
}

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

$arr_delete = [];
if(isset($_POST['delete_images']) && $_POST['delete_images'] != "") {
    $arr_delete = explode(',', $_POST['delete_images']);
}

for($i = 0; $i < count($arr_delete); $i++) {
    if(file_exists(H."/sys/files/gds/" . $all_images[$arr_delete[$i]])) {
        unlink(H."/sys/files/gds/" . $all_images[$arr_delete[$i]]);
    }

    $all_images[$arr_delete[$i]] = "";
}

for($i = count($all_images); $i < 5; $i++) {
    $all_images[$i] = "";
}



$dir = new Files(H.'/sys/tmp/');
$dir->setAllowedType(array('jpeg','jpg','png'));

// Проверка файлов для загрузки
if(isset($_FILES['img']) && count($_FILES['img'])) {
    foreach($_FILES['img']['name'] AS $key => $val) {
        if(!$dir->typeChecking($_FILES['img']['name'][$key])) {
            $error = [
                "type" => 2,
                "message" => "Фаил ".$_FILES['img']['name'][$key]." не подходит форматом,
                дуступные форматы jpeg, jpg, png"
            ];
            $api->assign("error", $error);

            exit;
        }

        if(@exif_imagetype($_FILES['img']['tmp_name'][$key]) != IMAGETYPE_JPEG
            && @exif_imagetype($_FILES['img']['tmp_name'][$key]) != IMAGETYPE_PNG) {
            $error = [
                "type" => 2,
                "message" => "Фаил ".$_FILES['img']['name'][$key]." не подходит форматом,
                дуступные форматы jpeg, jpg, png"
            ];
            $api->assign("error", $error);

            exit;
        }

        if($_FILES['img']['size'][$key] > 4 * (1024 * 1024)) {
            $error = [
                "type" => 2,
                "message" => "Фаил ".$_FILES['img']['name'][$key]." весит больше чем 4 Мб"
            ];
            $api->assign("error", $error);

            exit;
        }
    }
}





$replace = [];

if(isset($_POST['title']) && Text::strlen($_POST['title']) > 2) {
    $replace[] = $_POST['title'];
} else {
    $error = [
        "type" => 3,
        "message" => "Название должно быть более 3 символов"
    ];
    $api->assign("error", $error);
}
if(isset($_POST['category'])) {
    $replace[] = $_POST['category'];
} else {
    $error = [
        "type" => 3,
        "message" => "Не выбрана категория"
    ];
    $api->assign("error", $error);
}
if(isset($_POST['subcategory'])) {
    $replace[] = $_POST['subcategory'];
} else {
    $error = [
        "type" => 3,
        "message" => "Не выбрана подкатегория"
    ];
    $api->assign("error", $error);
}
if(isset($_POST['email'])) {
    $replace[] = $_POST['email'];
} else {
    $replace[] = "";
}
if(isset($_POST['phone_number'])) {
    $replace[] = $_POST['phone_number'];
} else {
    $replace[] = "";
}
if(isset($_POST['price'])) {
    $replace[] = $_POST['price'];
} else {
    $error = [
        "type" => 3,
        "message" => "Не указана цена"
    ];
    $api->assign("error", $error);
}
if(isset($_POST['state'])) {
    $replace[] = $_POST['state'];
} else {
    $error = [
        "type" => 3,
        "message" => "Не указано стостояния продоваемого товара"
    ];
    $api->assign("error", $error);
}
if(isset($_POST['state_balls'])) {
    $replace[] = $_POST['state_balls'];
} else {
    $error = [
        "type" => 3,
        "message" => "Не указано стостояния продоваемого товара"
    ];
    $api->assign("error", $error);
}
if(isset($_POST['description'])) {
    $replace[] = $_POST['description'];
} else {
    $replace[] = "";
}
if(isset($_POST['country_id']) && !empty($_POST['country_id']) && $_POST['country_id'] <= 4) {
    $replace[] = $_POST['country_id'];
} else {
    $error = [
        "type" => 3,
        "message" => "Не выбрана страна"
    ];
    $api->assign("error", $error);
}
if(isset($_POST['country_title'])  && Text::strlen($_POST['country_title']) > 1) {
    $replace[] = $_POST['country_title'];
} else {
    $error = [
        "type" => 3,
        "message" => "Возникла внутрення ошибка, выбор страны"
    ];
    $api->assign("error", $error);
}
if(isset($_POST['city_id'])) {
    $replace[] = $_POST['city_id'];
} else {
    $error = [
        "type" => 3,
        "message" => "Не выбран город"
    ];
    $api->assign("error", $error);
}
if(isset($_POST['city_title'])  && Text::strlen($_POST['city_title']) > 1) {
    $replace[] = $_POST['city_title'];
} else {
    $error = [
        "type" => 3,
        "message" => "Возникла внутрення ошибка, выбор города"
    ];
    $api->assign("error", $error);
}


$last_id = $id;
$folder = substr($last_id, -1);
$index_arr = 0;
if(isset($_FILES['img']) && count($_FILES['img'])) {
    foreach($_FILES['img']['name'] AS $key => $val) {
        $typef = $dir->typeFile($_FILES ['img']['name'][$key]);
        $namef = 'post_' . $key . '.' . $typef;

        if($rtr = $dir->upload(array($_FILES['img']['tmp_name'][$key] => $namef))) {

            for($i = 0; $i < 5; $i++) {
                if(!$all_images[$i]) {
                    $index_arr = $i;

                    break;
                }
            }

            $scr = new ImageResize(H.'/sys/tmp/' . $namef);
            $scr->resizeToWidth(600);
            $scr->saveImage(H."/sys/files/gds/folder_".$folder."/".'post_' . $last_id . "_" . $index_arr .
                ".jpg", 80);

            $all_images[$index_arr] = "folder_".$folder."/".'post_' . $last_id. "_" . $index_arr . ".jpg";

            unlink(H.'/sys/tmp/' . $namef);
        }
    }
}

for($i = 0; $i < 5; $i++) {
    if(!$all_images[$i]) {
        unset($all_images[$i]);
    }
}

$all_images = array_values($all_images);


$all_images_finish = [];

if(isset($_POST['delete_images']) && $_POST['delete_images'] != "") {
    for ($i = 0; $i < count($all_images); $i++) {
        $lol = rename(H."/sys/files/gds/" . $all_images[$i],
            H."/sys/files/gds/folder_".$folder."/".'post_' . $last_id. "_" . $i . ".jpg");

        $all_images_finish[] = "folder_".$folder."/".'post_' . $last_id. "_" . $i . ".jpg";
    }

    $all_images = $all_images_finish;
}


$replace[] = implode(",", $all_images);
$replace[] = TIME;
$replace[] = $id;

$up_gds = Db::me()->prepare("UPDATE `gds` SET `title` = ?, `category` = ?, `subcategory` = ?, `email` = ?, 
`phone_number` = ?, `price` = ?, `state` = ?, `state_balls` = ?, `description` = ?, `country_id` = ?, 
`country_title` = ?, `city_id` = ?, `city_title` = ?, `images` = ?, `time_update` = ? WHERE `id` = ? LIMIT 1");
$up_gds->execute($replace);


// TODO чтобы админам не высывалось  && $data['id_vk'] != $user->id_vk
if($user->access > 6) {
    $ank = new User($data['id_vk']);

    $params = [
        "text" => "Администратор отредактировал ваше объявление " . Text::substr($data['title'], 26)
    ];

    if($data['images']) {
        $images = explode(",", $data['images']);
        $params['image'] = $images[0];
    }

    $params['url'] = "/product/" . $data['id'];
    $params['button'] = "Открыть";

    $params['hash'] = "product/" . $data['id'];

    $result = $ank->addNotification('edit', $params);

    $api->assign("result", $result);
}