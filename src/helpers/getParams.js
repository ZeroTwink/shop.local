let $_GET = window
    .location
    .search
    .replace('?','')
    .split('&')
    .reduce(
        function(p,e){
            let a = e.split('=');
            p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
            return p;
        },
        {}
    );

if(process.env.NODE_ENV !== 'production') {
    $_GET = {
        vk_user_id: 30333918,
        vk_app_id: 6689902,
        vk_is_app_user: 0,
        vk_are_notifications_enabled: 0,
        vk_language: "ru",
        vk_access_token_settings: "menu,offline",
        vk_sign: "7iLBtLI1W9IEXCb80PJBR36AzD5WHWORkjCA8TgcQGo"
    };
}

export default $_GET;