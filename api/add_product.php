<?php
include_once('../sys/inc/start.php');
$api = new API();

$arr_images = [];

$in_news = Db::me()->prepare("INSERT INTO `gds` (`title`, `price`, `state`, `state_balls`, 
`description`, `time`) VALUES (?, ?, ?, ?, ?, ?)");
$in_news->execute(Array($_POST['title'], $_POST['price'], $_POST['state'],
    $_POST['state_balls'], $_POST['description'], TIME));


$last_id = Db::me()->lastInsertId();

$dir = new Files(H.'/sys/tmp/');
$dir->setAllowedType(array('jpeg','jpg','png'));

if(isset($_FILES['img']) && count($_FILES['img'])) {
    foreach($_FILES['img']['name'] AS $key => $val) {

        if($dir->typeChecking($_FILES['img']['name'][$key])) {
            $typef = $dir->typeFile($_FILES ['img']['name'][$key]);
            $namef = 'post_' . $key . '.' . $typef;

            if(!$rtr = $dir->upload(array($_FILES['img']['tmp_name'][$key] => $namef))) {

            }

            $folder = substr($last_id, -1);

            $scr = new ImageResize(H.'/sys/tmp/' . $namef);
            $scr->resizeToWidth(600);
            $scr->saveImage(H."/sys/files/gds/folder_".$folder."/".'post_' . $last_id . "_" . $key .
                ".jpg", 80);

            $arr_images[] = "folder_".$folder."/".'post_' . $last_id. "_" . $key . ".jpg";

            unlink(H.'/sys/tmp/' . $namef);

            $res = Db::me()->query("UPDATE `gds` SET `images` = '".implode(",", $arr_images)."' WHERE `id` = $last_id");
        } else {

        }
    }
}

$api->assign("id_product", $last_id);