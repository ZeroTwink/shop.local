import * as types from '../actions/types/gdsActionTypes';
let initState = {
    open: [] // все которые были открыты юзером
};

export default function gdsReducer(state = initState, action) {
    switch (action.type) {
        case types.GDS_LOAD:
            return Object.assign({}, state, action.payload);
        case types.GDS_UPDATE:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}