<?php

class Text
{
    static function toOutput($text)
    {
        $text = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
        $text = trim($text);
        
        $text = self::bbCode($text);
        
        $text = nl2br($text);
        
        return $text;
    }
    
    static public function bbCode($text) {
        $str_search = array(
            '#\[i\](.+?)\[\/i\]#is',
            '#\[b\](.+?)\[\/b\]#is',
            '#\[u\](.+?)\[\/u\]#is',
            '#\[center\](.+?)\[\/center\]#is',
            '#\[left\](.+?)\[\/left\]#is',
            '#\[right\](.+?)\[\/right\]#is'
        );
        
        $str_replace = array(
            '<em>$1</em>',
            '<b>$1</b>',
            '<span style="text-decoration:underline;">$1</span>',
            '<div style="text-align: center;">$1</div>',
            '<div style="text-align: left;">$1</div>',
            '<div style="text-align: right;">$1</div>'
        );
        
        while(preg_match( "#\[quote\](.+)\[/quote\]#ies", $text)) {
            $text = preg_replace('#\[quote\](.+)\[/quote\]#is', '<div class="quote">\\1</div>', $text);
        }
        /**
         * Спойлеры максемальная вложиность $i_spoiler
         */
        $i_spoiler = 0;
        while(preg_match( "#\[spoiler=([^\]]+)\](.+?)\[/spoiler\]#ies", $text)) {
            if ($i_spoiler >= 3) {
                $text = preg_replace("#\[spoiler=([^\]]+)\](.+?)\[/spoiler\]#is", '\\2', $text);  
                continue;
            }
            $text = preg_replace("#\[spoiler=([^\]]+)\](.+?)\[/spoiler\]#is",
                        '<div class="spoiler"><div class="spoiler_title">[+] $1</div>'
                    . '<div class="spoiler_content">$2</div></div>', $text);
            
            $i_spoiler++;
        }
        
        $text = preg_replace($str_search, $str_replace, $text);
        
        $text = preg_replace_callback('#\[img\](.+)\[\/img\]#isU', array('self', 'bbImage'), $text);
        
        $text = preg_replace_callback('#\[video=(.+)\](.+)\[\/video\]#isU', array('self', 'bbVideo'), $text);
        
        $text = preg_replace('#(^|\s|\(|\])([a-z]+://([^ \r\n\t`\'"<]+))(,|\[|<|\s|$)#iuU', '\1[url=\2]\2[/url]\4', $text);
        
        $text = preg_replace_callback('#\[url=(.+)\](.+)\[\/url\]#isU', array('self', 'bbUrl'), $text);
        
        return $text;
    }
    
    /**
     * 
     * @param array $m
     * @return string
     */
    static public function bbVideo($m)
    {
        switch ($m[1]) {
            case 'youtube':
                $str = preg_replace('#(https?://)?(www\.)?(youtube\.|youtu\.be)(com\/watch\?)?((v=)|\/)(\w+?)#iuU', 
                        '<div>'
                        . '<iframe src="https://www.youtube.com/embed/\7" '
                        . 'frameborder="0" allowfullscreen></iframe></div>', $m[2]);
                return $str;
                break;
            case 'sibnet':
                $str = preg_replace('#(https?://)?video\.sibnet\.ru\/video([0-9]+?)(.+?)#iuU', 
                        '<div>'
                        . '<iframe src="//video.sibnet.ru/shell.php?videoid=\2" '
                        . 'frameborder="0" allowfullscreen></iframe></div>', $m[2]);
                return $str;
                break;
            case 'vk':
                $str = preg_replace('#(.+?)#iuU', 
                        '<div>'
                        . '<iframe src="\1" '
                        . 'frameborder="0" allowfullscreen></iframe></div>', $m[2]);
                return $str;
                break;
        }
    }
    
    /**
     * @param array $matches
     * @return string
     */
    static public function bbImage($matches) {
        return '<img src="'.$matches[1].'" alt=""/>';
    }
    
    /**
     * @param array $matches
     * @return string
     */
    static public function bbUrl($matches) {
        
        $name_url = self::substr($matches[2], 50);
        
        if (preg_match('#://#', $matches[1])) {
            // внешняя ссылка
            $url = 'http://' . $_SERVER ['HTTP_HOST'] . '/away.php?to=' . urlencode($matches[1]);
            
            return '<a target="_blank" href="'.$url.'">'.$name_url.'</a>';
        } else {
            if($matches[1]{0} == '/') {
                $url = 'http://' . $_SERVER ['HTTP_HOST'] . $matches[1];
            } else {
                $url = 'http://' . $_SERVER ['HTTP_HOST'] . '/' . $matches[1];
            }
            return '<a href="'.$url.'">'.$name_url.'</a>';
        }
    }

    /**
     * получение кол-ва символов строки
     * Корректная работа с UTF-8
     * @param string $str
     * @return integer
     */
    static function strlen($str) {
        if (function_exists('mb_substr')) {
            return mb_strlen($str);
        }
        if (function_exists('iconv')) {
            return iconv_strlen($str);
        }
        return strlen($str);
    }

    /**
     * Получение подстроки
     * Корректная работа с UTF-8
     * @param string $text Исходная строка
     * @param integer $len Максимальная длина возвращаемой строки
     * @param integer $start Начало подстроки
     * @param string $mn Текст, подставляемый в конец строки при условии, что возхвращаемая строка меньще исходной
     * @return string
     */
    static function substr($text, $len, $start = 0, $mn = '...') {
        $text = trim($text);
        if (function_exists('mb_substr')) {
            return mb_substr($text, $start, $len) . (mb_strlen($text) > $len - $start ? $mn : null);
        }
        if (function_exists('iconv')) {
            return iconv_substr($text, $start, $len) . (iconv_strlen($text) > $len - $start ? $mn : null);
        }

        return $text;
    }

    /**
     * Делает ссылку вида 11-Slomannyj-Mech.html
     * @param $str string
     * @return string
     */
    static public function urlToString($str) {
        $url = str_replace(" ", "-", preg_replace("#[^a-z0-9" . preg_quote(' -', '#') . "]#Ui", "", self::translit($str)) . ".html");
        $url = preg_replace("#[\-]+#", "-", $url);
        return $url;
    }

    /**
     * добовляет вместо пробелов символ - всегда только один символ независимот от количества пробелов
     * @param $str string
     * @return string
     */
    static public function replaceSpaces($str) {
        $str = str_replace(" ", "-", $str);
        $str = preg_replace("#[\-]+#", "-", $str);
        return $str;
    }
    
    /**
     * Фильтрация и обработка текста, поступающего от пользователя
     * !!! не защищает от SQL-Inj или XSS
     * @param string $str
     * @return string
     */
    static public function inputText($str) {
        $str = preg_replace("#(^( |\r|\n)+)|(( |\r|\n)+$)|([^\pL\r\n\s0-9" . preg_quote(' []|`@\'ʼ"-–—_+=~!#:;$%^&*()?/\\.,<>{}©№«»', '#') . "]+)#ui", '', $str);
        $str = trim($str);
        
        return $str;
    }
    
    static function translit($string) {
        $table = array(
            'А' => 'A',
            'Б' => 'B',
            'В' => 'V',
            'Г' => 'G',
            'Ґ' => 'G',
            'Д' => 'D',
            'Е' => 'E',
            'Є' => 'YE',
            'Ё' => 'YO',
            'Ж' => 'ZH',
            'З' => 'Z',
            'И' => 'I',
            'І' => 'I',
            'Ї' => 'YI',
            'Й' => 'J',
            'К' => 'K',
            'Л' => 'L',
            'М' => 'M',
            'Н' => 'N',
            'О' => 'O',
            'П' => 'P',
            'Р' => 'R',
            'С' => 'S',
            'Т' => 'T',
            'У' => 'U',
            'Ў' => 'U',
            'Ф' => 'F',
            'Х' => 'H',
            'Ц' => 'C',
            'Ч' => 'CH',
            'Ш' => 'SH',
            'Щ' => 'CSH',
            'Ь' => '',
            'Ы' => 'Y',
            'Ъ' => '',
            'Э' => 'E',
            'Ю' => 'YU',
            'Я' => 'YA',
            'а' => 'a',
            'б' => 'b',
            'в' => 'v',
            'г' => 'g',
            'ґ' => 'g',
            'д' => 'd',
            'е' => 'e',
            'є' => 'ye',
            'ё' => 'yo',
            'ж' => 'zh',
            'з' => 'z',
            'и' => 'i',
            'і' => 'i',
            'ї' => 'yi',
            'й' => 'j',
            'к' => 'k',
            'л' => 'l',
            'м' => 'm',
            'н' => 'n',
            'о' => 'o',
            'п' => 'p',
            'р' => 'r',
            'с' => 's',
            'т' => 't',
            'у' => 'u',
            'ў' => 'u',
            'ф' => 'f',
            'х' => 'h',
            'ц' => 'c',
            'ч' => 'ch',
            'ш' => 'sh',
            'щ' => 'csh',
            'ь' => '',
            'ы' => 'y',
            'ъ' => '',
            'э' => 'e',
            'ю' => 'yu',
            'я' => 'ya',
        );
        return str_replace(array_keys($table), array_values($table), $string);
    }
}

