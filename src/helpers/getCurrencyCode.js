export default function getCurrencyCode(idCountry) {
    let countries = {
        "1": {
            "title": "Россия",
            "iso": "RUB"
        },
        "2": {
            "title": "Украина",
            "iso": "UAH"
        },
        "3": {
            "title": "Беларусь",
            "iso": "BYN"
        },
        "4": {
            "title": "Казахстан",
            "iso": "KAZ"
        }
    };

    if(countries[idCountry]) {
        return countries[idCountry]['iso'];
    } else {
        return countries['1']['iso'];
    }
}