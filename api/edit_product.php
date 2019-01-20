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


$folder = substr($id, -1);

$json_arr = "";
if(file_exists(H . "/sys/files/gds/folder_" . $folder . "/" . $id . ".json")) {
    $json_arr = Json::decode(file_get_contents(H . "/sys/files/gds/folder_" . $folder . "/" . $id . ".json"));
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
    $key = array_search($arr_delete[$i], $all_images);

    $path = substr($all_images[$key], 0, -4);

    if(file_exists(H."/sys/files/gds/" . $all_images[$key])) {
        unlink(H."/sys/files/gds/" . $all_images[$key]);
    }

    if(file_exists(H."/sys/files/gds/" . $path . "_original.jpg")) {
        unlink(H."/sys/files/gds/" . $path . "_original.jpg");
    }

    unset($all_images[$key]);

    if($json_arr) {
        unset($json_arr['images'][$key]);
    }
}


$all_images = array_values($all_images);

if($json_arr) {
    $json_arr['images'] = array_values($json_arr['images']);
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

if(isset($_POST['email']) && !empty($_POST['email']) && $data['email'] != $_POST['email']) {
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
    if(!$_POST['email']) {
        $replace[] = "";
    } else {
        $replace[] = $data['email'];
    }
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

if(isset($_POST['phone_number']) && !empty($_POST['phone_number']) && $data['phone_number'] != $_POST['phone_number']) {
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
    if(!$_POST['phone_number']) {
        $replace[] = "";
    } else {
        $replace[] = $data['phone_number'];
    }
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


$last_id = $id;

$index_arr = count($all_images);
if(isset($_FILES['img']) && count($_FILES['img'])) {
    foreach($_FILES['img']['name'] AS $key => $val) {
        $typef = $dir->typeFile($_FILES ['img']['name'][$key]);
        $namef = 'post_' . $key . '.' . $typef;

        if($rtr = $dir->upload(array($_FILES['img']['tmp_name'][$key] => $namef))) {

            $scr = new ImageResize(H.'/sys/tmp/' . $namef);
            $scr->resizeToWidth(900);
            $scr->saveImage(H."/sys/files/gds/folder_".$folder."/".'post_' . $last_id . "_" . $index_arr .
                ".jpg", 80);

            copy(H."/sys/files/gds/folder_".$folder."/".'post_' . $last_id . "_" . $index_arr .
                ".jpg", H."/sys/files/gds/folder_".$folder."/".'post_' . $last_id . "_" . $index_arr .
                "_original.jpg");

            $all_images[$index_arr] = "folder_".$folder."/".'post_' . $last_id. "_" . $index_arr . ".jpg";

            if($json_arr) {
                $json_arr['images'][$index_arr] = [];
                $json_arr['images'][$index_arr]['rotate'] = 0;
            }

            $index_arr++;

            unlink(H.'/sys/tmp/' . $namef);
        }
    }
}


$all_images_finish = [];

if(isset($_POST['delete_images']) && $_POST['delete_images'] != "") {
    for ($i = 0; $i < count($all_images); $i++) {
        $lol = rename(H."/sys/files/gds/" . $all_images[$i],
            H."/sys/files/gds/folder_".$folder."/".'post_' . $last_id. "_" . $i . ".jpg");

        $all_images_finish[] = "folder_".$folder."/".'post_' . $last_id. "_" . $i . ".jpg";

        $path = substr($all_images[$i], 0, -4);
        if(file_exists(H."/sys/files/gds/". $path . "_original.jpg")) {
            $lol2 = rename(H."/sys/files/gds/". $path . "_original.jpg",
                H."/sys/files/gds/folder_".$folder."/".'post_' . $last_id. "_" . $i . "_original.jpg");
        }
    }

    $all_images = $all_images_finish;
}


$replace[] = implode(",", $all_images);
$replace[] = TIME;
$replace[] = $id;

$up_gds = Db::me()->prepare("UPDATE `gds` SET `title` = ?, `category` = ?, `subcategory` = ?, `email` = ?, 
`phone_number` = ?, `price` = ?, `state` = ?, `state_balls` = ?, `description` = ?, `country_id` = ?, 
`country_title` = ?, `city_id` = ?, `city_title` = ?, `size` = ?, `images` = ?, `time_update` = ? WHERE `id` = ? LIMIT 1");
$up_gds->execute($replace);

if($json_arr) {
    file_put_contents(H . "/sys/files/gds/folder_" . $folder . "/" . $id . ".json", Json::encode($json_arr));
}


// TODO чтобы админам не высывалось  && $data['id_vk'] != $user->id_vk
if($user->access > 6 && $data['id_vk'] != $user->id_vk) {
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