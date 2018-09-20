export default function getCities(params) {

    let arr = {
        "count": 159057,
        "items": [{
            "id": 2256,
            "title": "Горловка",
            "important": 1
        }, {
            "id": 314,
            "title": "Киев",
            "important": 1
        }, {
            "id": 650,
            "title": "Днепропетровск (Днепр)"
        }, {
            "id": 223,
            "title": "Донецк"
        }, {
            "id": 628,
            "title": "Запорожье"
        }, {
            "id": 916,
            "title": "Кривой Рог"
        }, {
            "id": 1057,
            "title": "Львов"
        }, {
            "id": 552,
            "title": "Луганск"
        }, {
            "id": 455,
            "title": "Мариуполь"
        }, {
            "id": 377,
            "title": "Николаев"
        }, {
            "id": 292,
            "title": "Одесса"
        }, {
            "id": 185,
            "title": "Севастополь"
        }, {
            "id": 627,
            "title": "Симферополь"
        }, {
            "id": 280,
            "title": "Харьков"
        }, {
            "id": 761,
            "title": "Винница"
        }, {
            "id": 444,
            "title": "Чернигов"
        }]
    };

    if(params['q']) {
        let q_arr = arr['items'].filter((obj, i) => {
            if(~obj['title'].toLowerCase().indexOf(params['q'].toLowerCase())) {
                return true;
            }
            return false;
        });

        arr['count'] = q_arr.length;
        arr['items'] = q_arr;
    }

    return arr;
}