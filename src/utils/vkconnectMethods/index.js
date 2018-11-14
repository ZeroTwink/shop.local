import * as database from "./database/";
import * as users from "./users/";
import * as apps from "./apps/";

export default function mockMethod(nameMethod, params = {}) {
    let arrM = nameMethod.split(".");

    let data = null;

    switch (arrM[0]) {
        case "database" :
            data = database[arrM[1]](params);
            break;

        case "users" :
            data = users[arrM[1]](params);
            break;
        case "apps" :
            data = apps[arrM[1]](params);
            break;

        default:
        //nop;
    }

    return data;
}