<?php
include_once('../sys/inc/start.php');
$api = new API();

if($user->access < 15) {
    $error = [
        "type" => 1,
        "message" => "У вас нет прав для выполнения действия"
    ];
    $api->assign("error", $error);
    exit;
}

$time = TIME - 60 * 60 * 24 * 30;

$res = Db::me()->query("SELECT * FROM `gds` WHERE `time` < $time AND `archive` = 0");
$data = $res->fetchAll();

/**
 * @param string $text
 * @param string $hash
 * @param string $ids
 */
function sendMessagesVK($text = '', $hash = '', $ids = '') {
    $request_params = array(
        'user_ids' => $ids,
        'message' => $text,
        'fragment' => $hash,
        'v' => V_API,
        'access_token' => SERVER_KEY
    );
    $get_params = http_build_query($request_params);
    json_decode(file_get_contents('https://api.vk.com/method/notifications.sendMessage?'. $get_params));
}


$arr_ids_users = [];
$counter = 0;

foreach($data AS $key => $val) {
    $ank = new User($val['id_vk']);

    if(!$ank->set_notifications || !$ank->set_notifi_archive) {
        continue;
    }


    $params = [
        "text" => "В архив добавлено Ваше объявление",
        "name" => $val['title']
    ];

    if($val['images']) {
        $images = explode(",", $val['images']);
        $params['image'] = $images[0];
    }

    $params['url'] = "/product/" . $val['id'];
    $params['button'] = "Открыть";

    $params['hash'] = "product/" . $val['id'];

    $result = $ank->addNotification('archive', $params, false);


    $arr_ids_users[$val['id_vk']] = $val['id_vk'];
}


$loop =  ceil(count($arr_ids_users) / 100);
for($i = 0; $i < $loop; $i++) {
    $arr = array_slice($arr_ids_users, $i * 100, 100);

    sendMessagesVK("Есть объявления которые были перемещены в архив.", "notifications", implode(",", $arr));

    usleep (330000);
}

$res = Db::me()->query("UPDATE `gds` SET `archive` = 1 WHERE `time` < $time AND `archive` = 0");