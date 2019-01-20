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
                доступные форматы jpeg, jpg, png"
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
            "message" => "Введенный E-mail не соответствует E-mail, указанному на странице ВКонтакте"
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
            "message" => "Введенный номер телефона не соответствует номеру, указанному на странице ВКонтакте"
        ];
        $api->assign("error", $error);
        exit;
    }

    $replace[] = $_POST['phone_number'];
} else {
    $replace[] = "";
}

//if(isset($_POST['phone_number'])) {
//    $tel = $_POST['phone_number'];
//    $first = substr($tel, 0, 1);
//
//    if($first == "+") {
//        $tel = Text::substr($tel, 12, 1, "");
//    }
//
//    if(!preg_match("/^[0-9]{10,12}+$/", $tel)) {
//        $error = [
//            "type" => 3,
//            "message" => "Некорректно указан номер телефона"
//        ];
//        $api->assign("error", $error);
//        exit;
//    }
//    $replace[] = $tel;
//} else {
//    $replace[] = "";
//}

if(!isset($_POST['price']) || !is_numeric($_POST['price']) || $_POST['price'] > 99000000) {
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
    if(Text::strlen($_POST['description']) > 2000) {
        $error = [
            "type" => 3,
            "message" => "Описание превысило лимит в 2000 символов"
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


if(!isset($_POST['size']) || !is_numeric($_POST['size']) || $_POST['size'] > 5000) {
    $error = [
        "type" => 3,
        "message" => "Некорректно указан размер"
    ];
    $api->assign("error", $error);
    exit;
}
$replace[] = abs($_POST['size']);



$replace[] = TIME;

$in_news = Db::me()->prepare("INSERT INTO `gds` (`id_user`, `id_vk`, `title`, `category`, `subcategory`, 
`email`, `phone_number`, `price`, `state`, `state_balls`, 
`description`, `country_id`, `country_title`, `city_id`, `city_title`, `size`, `time`) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$in_news->execute($replace);


$last_id = Db::me()->lastInsertId();


$folder = substr($last_id, -1);

$json_arr = [
    "images" => [],
    "main_dir" => "folder_" . $folder
];

if(isset($_FILES['img']) && count($_FILES['img'])) {
    foreach($_FILES['img']['name'] AS $key => $val) {
        $typef = $dir->typeFile($_FILES ['img']['name'][$key]);
        $namef = 'post_' . $key . '.' . $typef;


        if($rtr = $dir->upload(array($_FILES['img']['tmp_name'][$key] => $namef))) {

            $rotate = 0;
            if(!empty($_POST['rotate']) && $_POST['rotate'][$key]) {
                $rotate = $_POST['rotate'][$key];
            }

            $scr = new ImageResize(H.'/sys/tmp/' . $namef);
            $scr->resizeToWidth(900, $rotate);
            $scr->saveImage(H."/sys/files/gds/folder_".$folder."/".'post_' . $last_id . "_" . $key .
                ".jpg", 80);

            copy(H."/sys/files/gds/folder_".$folder."/".'post_' . $last_id . "_" . $key .
                ".jpg", H."/sys/files/gds/folder_".$folder."/".'post_' . $last_id . "_" . $key .
                "_original.jpg");

            $arr_images[] = "folder_".$folder."/".'post_' . $last_id. "_" . $key . ".jpg";

            unlink(H.'/sys/tmp/' . $namef);

            $json_arr['images'][$key] = [
                "rotate" => 0
            ];
        }
    }

    $res = Db::me()->query("UPDATE `gds` SET `images` = '".implode(",", $arr_images)."' WHERE `id` = $last_id");
}

file_put_contents(H."/sys/files/gds/folder_".$folder."/" . $last_id . ".json", Json::encode($json_arr));

$res = Db::me()->prepare("SELECT * FROM `gds` WHERE `id` = ? LIMIT 1");
$res->execute([$last_id]);
$insert_product = $res->fetch();

$api->assign("product", $insert_product);