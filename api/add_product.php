<?php
include_once('../sys/inc/start.php');
$api = new API();

$arr_images = [];

$error = [
    "type" => 0,
    "message" => ""
];


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


$replace = [$user->id, $user->id_vk];

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
if(isset($_POST['country_id'])) {
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



$replace[] = TIME;

$in_news = Db::me()->prepare("INSERT INTO `gds` (`id_user`, `id_vk`, `title`, `category`, `subcategory`, 
`email`, `phone_number`, `price`, `state`, `state_balls`, 
`description`, `country_id`, `country_title`, `city_id`, `city_title`, `time`) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$in_news->execute($replace);


$last_id = Db::me()->lastInsertId();


if(isset($_FILES['img']) && count($_FILES['img'])) {
    foreach($_FILES['img']['name'] AS $key => $val) {
        $typef = $dir->typeFile($_FILES ['img']['name'][$key]);
        $namef = 'post_' . $key . '.' . $typef;


        if($rtr = $dir->upload(array($_FILES['img']['tmp_name'][$key] => $namef))) {
            $folder = substr($last_id, -1);

            $scr = new ImageResize(H.'/sys/tmp/' . $namef);
            $scr->resizeToWidth(600);
            $scr->saveImage(H."/sys/files/gds/folder_".$folder."/".'post_' . $last_id . "_" . $key .
                ".jpg", 80);

            $arr_images[] = "folder_".$folder."/".'post_' . $last_id. "_" . $key . ".jpg";

            unlink(H.'/sys/tmp/' . $namef);
        }
    }

    $res = Db::me()->query("UPDATE `gds` SET `images` = '".implode(",", $arr_images)."' WHERE `id` = $last_id");
}

$res = Db::me()->prepare("SELECT * FROM `gds` WHERE `id` = ? LIMIT 1");
$res->execute([$last_id]);
$insert_product = $res->fetch();

$api->assign("product", $insert_product);