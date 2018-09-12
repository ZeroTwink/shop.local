<?php

/**
 * Created by PhpStorm.
 * User: ZeroTwink
 * Date: 27.03.2016
 * Time: 13:48
 */
class ImageResize
{
    private $_path = '';
    private $_ext = '';
    private $_width = 0;
    private $_height = 0;
    private $_imageCreate = '';
    private $_saveImage = '';

    public function __construct($path)
    {
        $this->_path = $path;
        $pinfo = pathinfo($this->_path);
        $this->_ext = strtolower($pinfo['extension']);

        $this->_setSize();

        $this->_setScreen();
    }

    /**
     * Создает саму картинку
     * @return bool
     */
    private function _setScreen()
    {
        switch ($this->_ext) {
            case 'jpg':
                $this->_imageCreate = imagecreatefromjpeg($this->_path);
                break;
            case 'jpeg':
                $this->_imageCreate = imagecreatefromjpeg($this->_path);
                break;
            case 'gif':
                $this->_imageCreate = imagecreatefromgif($this->_path);
                break;
            case 'png':
                $this->_imageCreate = imagecreatefrompng($this->_path);
                break;
            default:
                return false;
        }
    }

    /**
     * Устанавливает ширину и высоту картинки
     */
    private function _setSize()
    {
        $arr = getimagesize($this->_path);

        $this->_width = $arr[0];
        $this->_height = $arr[1];
    }

    /**
     * Вернет размер картинки с пропорциями
     * @param int $width
     * @param int $height
     * @return array
     */
    private function _getSizeByFramework($width = 0, $height = 0)
    {
        if($this->_width <= $width && $this->_height <= $height) {
            return array($this->_width, $this->_height);
        }
        if($this->_width / $width > $this->_height / $height) {
            $newSize[0] = $width;
            $newSize[1] = round($this->_height * $width / $this->_width);
        }
        else {
            $newSize[1] = $height;
            $newSize[0] = round($this->_width * $height / $this->_height);
        }
        return $newSize;
    }

    /**
     * Просто сохраняет картинку
     * @param String $path
     * @param (int) $quality
     */
    public function saveImage($path, $quality)
    {
        imagejpeg($this->_saveImage,$path,$quality);
    }

    /**
     * Уменьшает картинку
     * @param int $width
     * @param int $height
     * @param bool $real
     */
    public function resize($width = 0, $height = 0, $real = false)
    {
        if ($width && $height && $real) {
            $newSize = array($width, $height);
        } elseif($width && $height) {
            $newSize = $this->_getSizeByFramework($width, $height);
        } else {
            $newSize = array($this->_width, $this->_height);
        }

        $newImage = imagecreatetruecolor($newSize[0], $newSize[1]);
        imagecopyresampled($newImage, $this->_imageCreate, 0, 0, 0, 0, $newSize[0], $newSize[1], $this->_width, $this->_height);

        $this->_saveImage = $newImage;
    }

    /**
     * Налаживает копирайт на картинку
     */
    public function copyrightOnImage() {
        $logo = imagecreatefrompng(H.'/sys/themes/default_full/img/copyright.png');

        $image_x = $this->width - 160;
        $image_y = $this->height - 60;

        $img = $this->getScreen();

        imagecopy($img, $logo, $image_x, $image_y, 0, 0, 150, 50);

        $this->_saveImage = $img;
    }

    /**
     * Ширину изображения делате заддоной, высота автоматически
     * @param int $width
     */
    public function resizeToWidth($width = 0)
    {
        $height = round($this->_height * $width / $this->_width);

        $newImage = imagecreatetruecolor($width, $height);

        imagecopyresampled($newImage, $this->_imageCreate, 0, 0, 0, 0, $width, $height, $this->_width, $this->_height);

        $this->_saveImage = $newImage;
    }
}