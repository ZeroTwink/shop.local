export default function userReducer(state = {}, action) {
    switch (action.type) {
        case "USER_LOAD":
            return action.payload;
        case "USER_UPDATE":
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}