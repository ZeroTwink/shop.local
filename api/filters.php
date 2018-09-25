<?php
include_once('../sys/inc/start.php');
$api = new API();

$words = urldecode($_GET['search']);

$search_array = preg_split('#\s+#u', $words);

if(count($search_array) > 4) {
    $search_array = array_slice($search_array, 0, 4);
}

$words_search = [];
$replace = [];
$sorting = "`time` DESC";

for ($i = 0; $i < count($search_array); $i++) {
    $word = $search_array[$i];

    $word = preg_replace('#[^a-zа-я0-9]#ui', '', $word);

    if(Text::strlen($word) < 3) {
        continue;
    }

    $words_search[] = $word;
}

$where = [];

if(count($words_search)) {
    if(count($words_search) < 2) {
        $word = $words_search[0] . '*';
        $words_search = [];
        $words_search[0] = $word;
    }

    $where[] = "MATCH(title) AGAINST(? IN BOOLEAN MODE)";
    $replace[] = implode(" ", $words_search);
}

if(isset($_GET['category']) && !empty($_GET['category'])) {
    $category = (int)$_GET['category'];

    $where[] = "`category` = ?";
    $replace[] = $category;
}

if(isset($_GET['subcategory']) && !empty($_GET['subcategory'])) {
    $subcategory = (int)$_GET['subcategory'];

    $where[] = "`subcategory` = ?";
    $replace[] = $subcategory;
}

if(isset($_GET['country_id']) && !empty($_GET['country_id'])) {
    $country_id = (int)$_GET['country_id'];

    $where[] = "`country_id` = ?";
    $replace[] = $country_id;
}

if(isset($_GET['city_id']) && !empty($_GET['city_id']) && $_GET['city_id']) {
    $city_id = (int)$_GET['city_id'];

    $where[] = "`city_id` = ?";
    $replace[] = $city_id;
}

if(isset($_GET['sorting']) && !empty($_GET['sorting'])) {
    $type_sorting = (int)$_GET['sorting'];

    if($type_sorting == 1) {
        $sorting = "`price` ASC";
    } elseif($type_sorting == 2) {
        $sorting = "`price` DESC";
    }
}

$page = $_GET['page'];
$offset = $page * 10;

$res = Db::me()->prepare("SELECT * FROM `gds` 
WHERE ".implode("AND ", $where)." ORDER BY $sorting LIMIT $offset, 10");
$res->execute($replace);
$search = $res->fetchAll();

$api->assign("gds", $search);