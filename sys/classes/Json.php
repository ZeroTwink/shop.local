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
                return json_encode($mixed, JSON_UNESCAPED_UNICODE);
            }
            else {
                return preg_replace_callback('/((\\\u[01-9a-fA-F]{4})+)/', array('self', 'prepareUTF8'),
                    json_encode($mixed)
                );
            }
        }

        return json_encode($mixed);
    }

    /**
     * Парсинг JSON строки в массив или объект
     * @param $string
     * @param bool $as_array true - вернется ассоциаливный массив, false - объект
     * @throws \Exception
     * @return array|mixed
     */
    static function decode($string, $as_array = true)
    {
        $result = json_decode($string, $as_array);

        $err = json_last_error();
        switch ($err) {
            case JSON_ERROR_DEPTH:
                throw new Exception('Maximum stack depth exceeded');
            case JSON_ERROR_CTRL_CHAR:
                throw new Exception('Unexpected control character found');
            case JSON_ERROR_SYNTAX:
                throw new Exception('Syntax error, malformed JSON');
            case JSON_ERROR_NONE:
                return $result;
        }
    }

    static function prepareUTF8($matches)
    {
        return json_decode('"'.$matches[1].'"');
    }
}