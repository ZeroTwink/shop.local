export default function gdsReducer(state = [], action) {
    switch (action.type) {
        case "GDS_LOAD":
            return action.payload;
        case "GDS_UPDATE":
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}