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

$time = TIME - 60 * 60 * 24 * 37;

$res = Db::me()->query("SELECT * FROM `gds` WHERE `time` < $time AND `archive` = 1");
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

$res_delete = Db::me()->prepare("DELETE FROM `gds` WHERE `id` = ?");

foreach($data AS $key => $val) {
    $ank = new User($val['id_vk']);

    if($val['images']) {
        $images = explode(",", $val['images']);
        foreach ($images AS $img) {
            if(file_exists(H."/sys/files/gds/" . $img)) {
                unlink(H."/sys/files/gds/" . $img);
            }

            $path = substr($img, 0, -4);

            if(file_exists(H."/sys/files/gds/" . $path . "_original.jpg")) {
                unlink(H."/sys/files/gds/" . $path . "_original.jpg");
            }
        }
    }

    $folder = substr($val['id'], -1);

    if(file_exists(H . "/sys/files/gds/folder_" . $folder . "/" . $val['id'] . ".json")) {
        unlink(H . "/sys/files/gds/folder_" . $folder . "/" . $val['id'] . ".json");
    }

    $res_delete->execute(Array($val['id']));


    if(!$ank->set_notifications || !$ank->set_notifi_archive) {
        continue;
    }

    $params = [
        "text" => "Архивное объявление было удалено",
        "name" => $val['title']
    ];

    $result = $ank->addNotification('archive', $params, false);


    $arr_ids_users[$val['id_vk']] = $val['id_vk'];
}

$api->assign("a", $arr_ids_users);

$loop =  ceil(count($arr_ids_users) / 100);
for($i = 0; $i < $loop; $i++) {
    $arr = array_slice($arr_ids_users, $i * 100, 100);

    sendMessagesVK("Есть объявления которые были удалены.", "notifications", implode(",", $arr));

    usleep (330000);
}

$api->assign("status", 1);