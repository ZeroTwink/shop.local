import cookie from "./cookies";

function soundPlay(idSound, volume) {
    if(cookie.getCookie("sound_disabled") <= 0 || !cookie.getCookie("sound_disabled")) {
        var s = createjs.Sound.play(idSound);

        if(volume) {
            s.volume = volume;
        }
    }
}

export default {
    soundPlay: soundPlay
};