<?php
abstract class Misc
{
    /**
     * читабельное представление времени с учетом часового пояса пользователя
     * @global \user $user
     * @param int $time Время в формате timestamp
     * @param boolean $adaptive Адаптивное представлени (вместо полной даты использовать "сегодня", "вчера")
     * @return string
     */
    static function when($time = null, $adaptive = true)
    {
        if (!$time) {
            $time = TIME;
        }
        $time_shift = 0;
        $time = $time + $time_shift * 3600;
        $vremja = date('j M Y в H:i', $time);
        $time_p[0] = date('j n Y', $time);
        $time_p[1] = date('H:i', $time);
        if ($adaptive && $time_p[0] == date('j n Y', TIME + $time_shift * 60 * 60)) {
            $vremja = date('H:i:s', $time);
        }
        if ($adaptive && $time_p[0] == date('j n Y', TIME - 60 * 60 * (24 - $time_shift))) {
            $vremja = "Вчера в " . $time_p[1];
        }
        $vremja = str_replace('Jan', 'Янв', $vremja);
        $vremja = str_replace('Feb', 'Фев', $vremja);
        $vremja = str_replace('Mar', 'Марта', $vremja);
        $vremja = str_replace('May', 'Мая', $vremja);
        $vremja = str_replace('Apr', 'Апр', $vremja);
        $vremja = str_replace('Jun', 'Июня', $vremja);
        $vremja = str_replace('Jul', 'Июля', $vremja);
        $vremja = str_replace('Aug', 'Авг', $vremja);
        $vremja = str_replace('Sep', 'Сент', $vremja);
        $vremja = str_replace('Oct', 'Окт', $vremja);
        $vremja = str_replace('Nov', 'Ноября', $vremja);
        $vremja = str_replace('Dec', 'Дек', $vremja);
        return $vremja;
    }
    
    /**
     *
     * @param int $num
     * @param string $one
     * @param string $two
     * @param string $more
     * @return string
     */
    static function number($num, $one, $two, $more)
    {
        $num = (int)$num;
        $l2 = substr($num, strlen($num) - 2, 2);

        if ($l2 >= 5 && $l2 <= 20)
            return $more;
        $l = substr($num, strlen($num) - 1, 1);
        switch ($l) {
            case 1:
                return $one;
                break;
            case 2:
                return $two;
                break;
            case 3:
                return $two;
                break;
            case 4:
                return $two;
                break;
            default:
                return $more;
                break;
        }
    }
    
    /**
     * Вычисление возраста
     * @param int $g Год
     * @param int $m Месяц
     * @param int $d День
     * @param boolean $read
     * @return string
     */
    static function getAge($g, $m, $d, $read = false)
    {
        if (strlen($g) == 2)
            $g += 1900;
        if (strlen($g) == 3)
            $g += 1000;
        $age = date('Y') - $g;
        if (date('n') < $m)
            $age--; // год не полный, если текущий месяц меньше
        elseif (date('n') == $m && date('j') < $d)
            $age--; // год не полный, если текущий месяц совпадает, но день меньше
        if ($read)
            return $age . ' ' . self::number($age, 'год', 'года', 'лет');

        return $age;
    }
    
    /**
     * Вывод названия месяца
     * @param int $num номер месяца (с 1)
     * @param int $v вариант написания
     * @return string
     */
    static function getLocaleMonth($num, $v = 1)
    {
        switch ($num) {
            case 1:
                return 'Январ' . ($v ? 'я' : 'ь');
            case 2:
                return 'Феврал' . ($v ? 'я' : 'ь');
            case 3:
                return 'Март' . ($v ? 'а' : '');
            case 4:
                return 'Апрел' . ($v ? 'я' : 'ь');
            case 5:
                return 'Ма' . ($v ? 'я' : 'й');
            case 6:
                return 'Июн' . ($v ? 'я' : 'ь');
            case 7:
                return 'Июл' . ($v ? 'я' : 'ь');
            case 8:
                return 'Август' . ($v ? 'а' : '');
            case 9:
                return 'Сентябр' . ($v ? 'я' : 'ь');
            case 10:
                return 'Октябр' . ($v ? 'я' : 'ь');
            case 11:
                return 'Ноябр' . ($v ? 'я' : 'ь');
            case 12:
                return 'Декабр' . ($v ? 'я' : 'ь');
            default:
                return false;
        }
    }
}

