<?php
/**
 * Абстракция для работы с json
 * Class json
 */
abstract class Json
{

    /**
     * Сериализация произвольных типов данных в JSON
     * У объектов берутся только публичные свойства
     * @param $mixed
     * @param bool $unescape_unicode Не экранировать юникод
     * @return string
     */
    static function encode($mixed, $unescape_unicode = true)
    {
        if ($unescape_unicode) {
            if (defined('JSON_UNESCAPED_UNICODE')) {
                return json_encode($mixed, JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);
            }
            else {
                return preg_replace_callback('/((\\\u[01-9a-fA-F]{4})+)/', array('self', 'prepareUTF8'),
                    json_encode($mixed)
                );
            }
        }

        return json_encode($mixed);
    }


    static function decode($string, $as_array = true)
    {
        $result = json_decode($string, $as_array);

        return $result;
    }

    static function prepareUTF8($matches)
    {
        return json_decode('"'.$matches[1].'"');
    }
}