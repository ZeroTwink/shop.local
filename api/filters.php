<?php
include_once('../sys/inc/start.php');
$api = new API();

$words = urldecode($_GET['search']);

$search_array = preg_split('#\s+#u', $words);

//print_r($search_array);

if(count($search_array) > 4) {
    $search_array = array_slice($search_array, 0, 4);
}

$words_search = [];
$words_search_like = [];
$replace = [];
$sorting = "`time` DESC";

for ($i = 0; $i < count($search_array); $i++) {
    $word = $search_array[$i];

    $word = preg_replace('#[^a-zа-я0-9\-]#ui', '', $word);

    if(Text::strlen($word) < 2) {
        continue;
    }

    $words_search_like[] = $word;
    $words_search[] = $word;
}

if($words && !count($words_search_like)) {
    $error = [
        "type" => 2,
        "message" => "В строке поиска, есть некорректные символы"
    ];
    $api->assign("error", $error);

    exit;
}

$where = [];

if(count($words_search)) {
    if(count($words_search) < 2) {
        $word = $words_search[0] . '*';
        $words_search = [];
        $words_search[0] = $word;
    }

//    $where[] = "MATCH(title) AGAINST(? IN BOOLEAN MODE)";

    $sql_string_words = '';
    foreach($words_search AS $w) {
        $sql_string_words .= $w . "* ";
    }
//    $replace[] = implode(" ", $words_search);
//    $replace[] = $sql_string_words;
}

if(count($words_search_like)) {
    foreach($words_search_like AS $w) {
        $where[] = "`title` LIKE ?";
        $replace[] = "%$w%";
    }
}

if(isset($_GET['category'])) {
    $category = (int)$_GET['category'];

    $where[] = "`category` = ?";
    $replace[] = $category;
}

if(isset($_GET['subcategory'])) {
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

if(isset($_GET['state']) && ($_GET['state'] == 0 || $_GET['state'] == 1)) {
    $state = (int)$_GET['state'];

    $where[] = "`state` = ?";
    $replace[] = $state;
}

if(isset($_GET['sorting']) && !empty($_GET['sorting'])) {
    $type_sorting = (int)$_GET['sorting'];

    if($type_sorting == 1) {
        $sorting = "`price` ASC";
    } elseif($type_sorting == 2) {
        $sorting = "`price` DESC";
    } elseif($type_sorting == 3) {
        $sorting = "`time` DESC";
        $sorting_two = "`tmp`.`price` ASC";
    } elseif($type_sorting == 4) {
        $sorting = "`time` DESC";
        $sorting_two = "`tmp`.`price` DESC";
    }
}

$page = $_GET['page'];
$offset = $page * 10;

//print_r(implode(" AND ", $where));

if(isset($sorting_two)) {
    $res = Db::me()->prepare("
      SELECT * FROM (SELECT * FROM `gds` 
      WHERE ".implode("AND ", $where)." AND `archive` = 0 ORDER BY $sorting LIMIT 100
    ) AS tmp ORDER BY $sorting_two");
    $res->execute($replace);
    $search = $res->fetchAll();
} else {
    $res = Db::me()->prepare("SELECT * FROM `gds` 
    WHERE ".implode(" AND ", $where)." AND `archive` = 0 ORDER BY $sorting LIMIT $offset, 10");
    $res->execute($replace);
    $search = $res->fetchAll();
}

$api->assign("gds", $search);