import * as database from "./database/";
import * as users from "./users/";

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

        default:
        //nop;
    }

    return data;
}