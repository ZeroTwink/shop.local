<?php

class Checks
{
    static public $_cat = [
        9,
        6,
        7,
        4,
        8,
        11,
        14,
        19,
        6,
        8
    ];

    static public function titleProduct($title)
    {
//        $title = preg_replace( '/[^[:print:]]/', '', $title);

        if(!isset($title) || Text::strlen($title) < 3) {
            return [
                "error" => [
                    "type" => 3,
                    "message" => "Название должно быть не менее 3 символов"
                ]
            ];
        }

        return $title;
    }

    static public function category($cat)
    {
        if(!isset($cat) || $cat > count(self::$_cat) - 1 || $cat < 0) {
            return [
                "error" => [
                    "type" => 3,
                    "message" => "Ошибка выбора категории"
                ]
            ];
        }

        return (int)$cat;
    }

    static public function subcategory($subcat, $cat)
    {
        if(!isset($subcat) || $subcat > self::$_cat[$cat] || $subcat < 0) {
            return [
                "error" => [
                    "type" => 3,
                    "message" => "Ошибка выбора подкатегории"
                ]
            ];
        }

        return (int)$subcat;
    }

    static public function email($email)
    {
        if (!preg_match('#^[a-z0-9\-\._]+\@([a-z0-9-_]+\.)+([a-z0-9]{2,4})\.?$#ui', $email)) {
            return [
                "error" => [
                    "type" => 3,
                    "message" => "Не верный E-mail"
                ]
            ];
        }

        return $email;
    }
}