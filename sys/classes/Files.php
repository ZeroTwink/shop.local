<?php
class Files 
{
    private $data = array();
    private $files_type = array("jpg", "gif", "bmp", "jpeg", "png", "txt","rar","zip");

    function __construct($path) {
        $this->data['path'] = $path;
    }
	
    // Устанавливаем типы загружаемых файлов
    function setAllowedType($type) {
        if (is_array($type)) {
            $this->files_type = $type;
        } else {
            $this->files_type = explode(",", $type);
        }
    }
	 
    // Проверка типа загружаемогу типа, доступно для загрузки или нет
    function typeChecking($file) {
        $pinfo = pathinfo($file);
        $type_eng = strtolower($pinfo['extension']);
        if (in_array($type_eng, $this->files_type)) {
            return true;
        } else {
            return false; 
        }
    }
	 
    // Просто узнаем тип файла
    function typeFile($file) {
        $pinfo = pathinfo($file);
        return $type_eng = strtolower($pinfo['extension']);
    }
	
    // Загружаем файл на сервер
    function upload($file) {
        $file = (array) $file;
        foreach ($file as $path => $val) {
            $name = Text::translit($val);
            if ($this->typeChecking($name)) {
                if (move_uploaded_file($path, $this->data['path'] . $name)) {
                    return $name; // возврат названия, для обновления в базе
                } else {
                    return false;	
                }
            } else {
                return false;
            }
        }
    }

}
?>