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

$title = Checks::titleProduct($_POST['title']);
if(isset($title['error'])) {
    $api->assign("error", $title['error']);
    exit;
}
$replace[] = $title;

$category = Checks::category($_POST['category']);
if(isset($category['error'])) {
    $api->assign("error", $category['error']);
    exit;
}
$replace[] = $category;

$subcategory = Checks::subcategory($_POST['subcategory'], $_POST['category']);
if(isset($subcategory['error'])) {
    $api->assign("error", $subcategory['error']);
    exit;
}
$replace[] = $subcategory;

if(isset($_POST['email']) && !empty($_POST['email'])) {
    $str = API_ID . API_SECRET . $user->id_vk . "email" . $_POST['email'];
    $sign = rtrim(strtr(base64_encode(hash('sha256', $str, true)), '+/', '-_'), '=');

    if(!isset($_POST['sign_email']) || $sign != $_POST['sign_email']) {
        $error = [
            "type" => 3,
            "message" => "Указанный E-mail не совпадает с указаным во Вконтакте"
        ];
        $api->assign("error", $error);
        exit;
    }

    $replace[] = $_POST['email'];
} else {
    $replace[] = "";
}

//if(isset($_POST['email']) && !empty($_POST['email'])) {
//    $email = Checks::email($_POST['email']);
//    if(isset($email['error'])) {
//        $api->assign("error", $email['error']);
//        exit;
//    }
//    $replace[] = $email;
//} else {
//    $replace[] = "";
//}

if(isset($_POST['phone_number']) && !empty($_POST['phone_number'])) {
    $str = API_ID . API_SECRET . $user->id_vk . "phone_number" . $_POST['phone_number'];
    $sign = rtrim(strtr(base64_encode(hash('sha256', $str, true)), '+/', '-_'), '=');

    if(!isset($_POST['sign_phone_number']) || $sign != $_POST['sign_phone_number']) {
        $error = [
            "type" => 3,
            "message" => "Указанный номер телефона не совпадает с номером указаным во Вконтакте"
        ];
        $api->assign("error", $error);
        exit;
    }

    $replace[] = $_POST['phone_number'];
} else {
    $replace[] = "";
}

//if(isset($_POST['phone_number'])) {
//    $replace[] = $_POST['phone_number'];
//} else {
//    $replace[] = "";
//}

if(!isset($_POST['price']) || !is_numeric($_POST['price'])) {
    $error = [
        "type" => 3,
        "message" => "Некорректно указана цена"
    ];
    $api->assign("error", $error);
    exit;
}
$replace[] = abs($_POST['price']);

if(!isset($_POST['state']) || $_POST['state'] < 0 || $_POST['state'] > 1) {
    $error = [
        "type" => 3,
        "message" => "Некорректно указано состояние товара"
    ];
    $api->assign("error", $error);
    exit;
}
$replace[] = (int)$_POST['state'];

if(!isset($_POST['state_balls']) || $_POST['state_balls'] > 5 || $_POST['state_balls'] < 0) {
    $error = [
        "type" => 3,
        "message" => "Не указано стостояния продоваемого товара"
    ];
    $api->assign("error", $error);
    exit;
}
$replace[] = (int)$_POST['state_balls'];

if(isset($_POST['description'])) {
    if(Text::strlen($_POST['description']) > 5000) {
        $error = [
            "type" => 3,
            "message" => "Описание превысило лимит в 5000 символов"
        ];
        $api->assign("error", $error);
        exit;
    }
    $replace[] = $_POST['description'];
} else {
    $replace[] = "";
}




if(!isset($_POST['country_id']) || $_POST['country_id'] < 0 || $_POST['country_id'] > 4) {
    $error = [
        "type" => 3,
        "message" => "Не выбрана страна"
    ];
    $api->assign("error", $error);
    exit;
}
$replace[] = (int)$_POST['country_id'];

$countriesArr = [
    "1" => "Россия",
    "2" => "Украина",
    "3" => "Беларусь",
    "4" => "Казахстан"
];

if(!isset($countriesArr[$_POST['country_id']])) {
    $error = [
        "type" => 3,
        "message" => "Возникла ошибка выбора страны"
    ];
    $api->assign("error", $error);
    exit;
}
$replace[] = $countriesArr[$_POST['country_id']];



if(!isset($_POST['city_id']) || empty($_POST['city_id']) || !is_numeric($_POST['city_id'])) {
    $error = [
        "type" => 3,
        "message" => "Возникла ошибка выбора города"
    ];
    $api->assign("error", $error);
    exit;
}

$request_params = array(
    "country_id" => $_POST['country_id'],
    'q' => Text::substr($_POST['city_title'], 15, 0, ""),
    'v' => V_API,
    'access_token' => SERVER_KEY
);
$get_params = http_build_query($request_params);
$result = json_decode(file_get_contents('https://api.vk.com/method/database.getCities?'. $get_params), true);

$q = false;
if(isset($result['response']) && isset($result['response']['items'])) {
    foreach ($result['response']['items'] AS $key => $val) {
        if($val['id'] == $_POST['city_id']) {
            $q = true;

            $replace[] = $val['id']; // id города
            $replace[] = $val['title']; // title города
        }
    }
}

if(!$q) {
    $error = [
        "type" => 3,
        "message" => "Не выбран город"
    ];
    $api->assign("error", $error);
    exit;
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
        "text" => "Администратор отредактировал Ваше объявление",
        "name" => $data['title']
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


$res = Db::me()->prepare("SELECT * FROM `gds` WHERE `id` = ? LIMIT 1");
$res->execute([$id]);
$update_product = $res->fetch();

$api->assign("product", $update_product);